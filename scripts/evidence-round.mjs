import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const ADDRESS = "0xFCA5d6960da9833f241c98f5677a0284534B7723";
const account = createAccount();
const write = createClient({ chain: studionet, account });
const read = createClient({ chain: studionet });

function asRecord(value) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value && typeof value === "object") return value;
  return {};
}

function leaderFailure(receipt) {
  const consensus = asRecord(receipt.consensus_data ?? receipt.consensusData);
  const leaders = consensus.leader_receipt ?? consensus.leaderReceipt;
  const first = Array.isArray(leaders) ? leaders[0] : leaders;
  const leader = asRecord(first);
  const execution = String(leader.execution_result ?? "").toUpperCase();
  if (execution === "ERROR") {
    const genvm = asRecord(leader.genvm_result);
    return genvm.stderr || leader.error || "Leader execution error";
  }
  if (receipt.txExecutionResultName === "FINISHED_WITH_ERROR") {
    return "Contract execution finished with an error.";
  }
  return null;
}

async function writeAndWait(functionName, args, retries, interval) {
  const hash = await write.writeContract({
    address: ADDRESS,
    functionName,
    args,
    value: 0n,
  });
  console.log(`${functionName} hash ${hash}`);
  const receipt = await read.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval,
    retries,
  });
  const failure = leaderFailure(receipt);
  if (failure) {
    throw new Error(`${functionName} failed: ${failure}\n${hash}`);
  }
  console.log(`${functionName} FINALIZED leader-ok`);
  return hash;
}

const evidence = [
  "https://en.wikipedia.org/wiki/Vitalik_Buterin",
  "https://vitalik.ca",
].join("\n");

const policyHash = await writeAndWait(
  "publish_policy",
  [
    "Base Airdrop Uniqueness Policy",
    "This policy applies to the Base airdrop on the Base network. Eligible only if fetched public pages clearly identify a unique human operator and connect that operator to the target wallet on Base. Ineligible only if fetched Base explorer pages or user links clearly show coordinated multi-wallet farming or cluster control on Base. If sources fail, are thin, or do not connect the wallet to a unique operator on Base, the outcome is Contested. Do not invent transactions, balances, or identity claims.",
    "base-airdrop",
    "accepted",
  ],
  40,
  3000,
);

const policies = asRecord(
  await read.readContract({
    address: ADDRESS,
    functionName: "list_policy_ids",
    args: [],
    jsonSafeReturn: true,
  }),
);
const policyId = policies.last_policy_id;
console.log("policy", policyId);

const submitHash = await writeAndWait(
  "submit_case",
  [
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    policyId,
    evidence,
    0n,
  ],
  40,
  3000,
);

const cases = asRecord(
  await read.readContract({
    address: ADDRESS,
    functionName: "list_case_ids",
    args: [],
    jsonSafeReturn: true,
  }),
);
const caseId = cases.last_case_id;
console.log("case", caseId);

const judgeHash = await writeAndWait("judge_case", [caseId], 180, 5000);

const verdict = await read.readContract({
  address: ADDRESS,
  functionName: "get_verdict",
  args: [caseId],
  jsonSafeReturn: true,
});
const caze = await read.readContract({
  address: ADDRESS,
  functionName: "get_case",
  args: [caseId],
  jsonSafeReturn: true,
});

console.log(
  JSON.stringify(
    {
      account: account.address,
      contract: ADDRESS,
      policyId,
      caseId,
      evidence: caze.evidence_links,
      policyHash,
      submitHash,
      judgeHash,
      verdict,
    },
    null,
    2,
  ),
);

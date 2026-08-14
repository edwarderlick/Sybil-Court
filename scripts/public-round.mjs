import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const ADDRESS = "0xE71AF699a7B2EA9e7b662a4da7e0699c5C301F28";
const PUBLIC_PROXY = "https://sybil-court.vercel.app/api/genlayer";
const account = createAccount();
const write = createClient({ chain: studionet, account });
const publicChain = {
  ...studionet,
  rpcUrls: {
    ...studionet.rpcUrls,
    default: { http: [PUBLIC_PROXY] },
  },
};
const read = createClient({ chain: publicChain });

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
  console.log(`${functionName} FINALIZED via public proxy`);
  return hash;
}

const policyHash = await writeAndWait(
  "publish_policy",
  [
    "Public Vercel Policy",
    "Eligible only if public pages clearly show a unique operator. If sources fail or are thin, the outcome is Contested. Do not invent activity.",
    "vercel-public",
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
    "vercel-public-operator-1",
    policyId,
    "https://test-server.genlayer.com/static/genvm/hello.html",
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

console.log(
  JSON.stringify(
    {
      account: account.address,
      policyId,
      caseId,
      policyHash,
      submitHash,
      judgeHash,
      verdict,
    },
    null,
    2,
  ),
);

import { execSync } from "node:child_process";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const ADDRESS = "0x114F72F1b65f60d8ed9244B573F0c7F3a980814B";
const caseId = process.argv[2] || "CASE-0005";
const account = createAccount();
const write = createClient({ chain: studionet, account });
const read = createClient({ chain: studionet });

function asRecord(value) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value && typeof value === "object") return value;
  return {};
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

console.log("judge account", account.address, "case", caseId);
execSync(
  `genlayer account send --account sybil-court-deploy ${account.address} 1gen`,
  { stdio: "inherit" },
);

const hash = await write.writeContract({
  address: ADDRESS,
  functionName: "judge_case",
  args: [caseId],
  value: 0n,
});
console.log("judge_case hash", hash);

let lastError = null;
for (let attempt = 0; attempt < 8; attempt++) {
  try {
    const receipt = await read.waitForTransactionReceipt({
      hash,
      status: TransactionStatus.FINALIZED,
      interval: 10_000,
      retries: 80,
    });
    const failure = leaderFailure(receipt);
    if (failure) throw new Error(failure);
    console.log("FINALIZED leader-ok");
    lastError = null;
    break;
  } catch (error) {
    lastError = error;
    console.log("receipt attempt", attempt + 1, error.message);
    await sleep(25_000);
  }
}

const docket = asRecord(
  await read.readContract({
    address: ADDRESS,
    functionName: "get_case",
    args: [caseId],
    jsonSafeReturn: true,
  }),
);
const verdict = asRecord(docket.verdict);
const eligible = asRecord(
  await read.readContract({
    address: ADDRESS,
    functionName: "is_eligible",
    args: [docket.wallet],
    jsonSafeReturn: true,
  }),
);
const treasury = asRecord(
  await read.readContract({
    address: ADDRESS,
    functionName: "get_treasury",
    jsonSafeReturn: true,
  }),
);
console.log(
  JSON.stringify(
    {
      hash,
      caseId,
      status: docket.status,
      outcome: verdict.outcome,
      bondStatus: docket.bond_status,
      eligible: eligible.eligible,
      treasuryAtto: treasury.treasury_atto,
      verdictLength: String(verdict.text || "").length,
      summary: verdict.vote_summary,
    },
    null,
    2,
  ),
);
if (lastError && !verdict.issued) throw lastError;

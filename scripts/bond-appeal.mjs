import { execSync } from "node:child_process";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const ADDRESS = "0x573ae3ba443fc3b5bAA52b9B1030c4eA0c0cf69c";
const APPEAL_BOND = 2n * 10n ** 16n;
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

async function writeAndWait(functionName, args, value, retries, interval) {
  const hash = await write.writeContract({
    address: ADDRESS,
    functionName,
    args,
    value,
  });
  console.log(`${functionName} hash ${hash} value ${value}`);
  let lastError = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const receipt = await read.waitForTransactionReceipt({
        hash,
        status: TransactionStatus.FINALIZED,
        interval,
        retries,
      });
      const failure = leaderFailure(receipt);
      if (failure) throw new Error(`${functionName} failed: ${failure}\n${hash}`);
      console.log(`${functionName} FINALIZED leader-ok`);
      return hash;
    } catch (error) {
      lastError = error;
      console.log(
        `${functionName} receipt attempt ${attempt + 1} failed: ${error.message}`,
      );
      await sleep(20000);
    }
  }
  throw lastError;
}

async function call(functionName, args = []) {
  return read.readContract({
    address: ADDRESS,
    functionName,
    args,
    jsonSafeReturn: true,
  });
}

console.log("appealer", account.address);
execSync(
  `genlayer account send --account sybil-court-deploy ${account.address} 1gen`,
  { stdio: "inherit" },
);

const fileHash = await writeAndWait(
  "file_appeal",
  ["CASE-0003", "Second-round review of the incomplete Solana record.", APPEAL_BOND],
  APPEAL_BOND,
  40,
  4000,
);
const afterFile = asRecord(await call("get_bond_status", ["CASE-0003"]));
const judgeHash = await writeAndWait("judge_appeal", ["CASE-0003"], 0n, 180, 6000);
const afterJudge = asRecord(await call("get_bond_status", ["CASE-0003"]));
const verdict = asRecord(await call("get_verdict", ["CASE-0003"]));
const treasury = asRecord(await call("get_treasury"));
const submitterCredit = asRecord(
  await call("get_credit", ["0x54984fDf7Aa4fA37Fe9d1e140D0E72b45E684707"]),
);
const appealerCredit = asRecord(await call("get_credit", [account.address]));

console.log(
  JSON.stringify(
    {
      fileHash,
      judgeHash,
      afterFile,
      afterJudge,
      appealOutcome: verdict.appeal_verdict,
      treasury,
      submitterCredit,
      appealerCredit,
    },
    null,
    2,
  ),
);

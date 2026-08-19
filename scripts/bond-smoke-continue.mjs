import { execSync } from "node:child_process";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const ADDRESS = "0x573ae3ba443fc3b5bAA52b9B1030c4eA0c0cf69c";
const BOND = 10n ** 16n;
const APPEAL_BOND = BOND * 2n;
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
      if (failure) {
        throw new Error(`${functionName} failed: ${failure}\n${hash}`);
      }
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

console.log("continue account", account.address);
execSync(
  `genlayer account send --account sybil-court-deploy ${account.address} 1gen`,
  { stdio: "inherit" },
);

const policyHash = await writeAndWait(
  "publish_policy",
  [
    "Solana Airdrop Uniqueness Policy",
    "This policy applies to the Solana airdrop. Eligible only if fetched pages identify a unique human and connect them to the target Solana wallet. Ineligible only if fetched pages show coordinated farming on Solana. Otherwise Contested. Do not invent transactions or identity.",
    "contested-bond",
    "accepted",
  ],
  0n,
  40,
  4000,
);
const policies = asRecord(await call("list_policy_ids"));
const policyId = policies.last_policy_id;
const submitHash = await writeAndWait(
  "submit_case",
  [
    "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9",
    policyId,
    "https://en.wikipedia.org/wiki/Solana_(blockchain_platform)",
    BOND,
  ],
  BOND,
  40,
  4000,
);
const cases = asRecord(await call("list_case_ids"));
const contestedId = cases.last_case_id;
console.log("contested", contestedId, asRecord(await call("get_bond_status", [contestedId])));

const jobs = [
  ["CASE-0001", "eligible"],
  ["CASE-0002", "ineligible"],
  [contestedId, "contested"],
];
const judged = {};
for (const [caseId, label] of jobs) {
  console.log("=== judge", label, caseId, "===");
  judged[label] = {
    caseId,
    judgeHash: await writeAndWait("judge_case", [caseId], 0n, 180, 6000),
    bond: asRecord(await call("get_bond_status", [caseId])),
    verdict: asRecord(await call("get_verdict", [caseId])),
  };
  console.log(label, judged[label].verdict?.verdict?.outcome, judged[label].bond);
}

const eligibleCheck = asRecord(
  await call("is_eligible", ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"]),
);
const ineligibleCheck = asRecord(
  await call("is_eligible", ["0xfe7101d155eb11640e5a4bf342cd066dce51e9e3"]),
);
const treasuryAfterFirst = asRecord(await call("get_treasury"));

let appeal = {};
const contestedBond = judged.contested.bond;
if (contestedBond.appeal_window_open) {
  appeal.fileHash = await writeAndWait(
    "file_appeal",
    [contestedId, "Second-round review of the incomplete Solana record.", APPEAL_BOND],
    APPEAL_BOND,
    40,
    4000,
  );
  appeal.judgeHash = await writeAndWait(
    "judge_appeal",
    [contestedId],
    0n,
    180,
    6000,
  );
  appeal.bond = asRecord(await call("get_bond_status", [contestedId]));
  appeal.verdict = asRecord(await call("get_verdict", [contestedId]));
}

console.log(
  JSON.stringify(
    {
      contract: ADDRESS,
      account: account.address,
      policyHash,
      submitHash,
      contestedId,
      judged,
      eligibleCheck,
      ineligibleCheck,
      treasuryAfterFirst,
      appeal,
      treasuryFinal: asRecord(await call("get_treasury")),
      creditFinal: asRecord(await call("get_credit", [account.address])),
      firstSubmitterCredit: asRecord(
        await call("get_credit", [
          "0x24feBe882b938EF26e5299A0CE84E176342A3269",
        ]),
      ),
    },
    null,
    2,
  ),
);

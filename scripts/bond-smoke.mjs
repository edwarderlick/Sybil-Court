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

const ROUNDS = {
  eligible: {
    wallet: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    title: "Public Figure Wallet Uniqueness Policy",
    body: "Eligible if any fetched SOURCE page names a unique human and states that the exact target wallet is that person's wallet. FETCH_FAILED or FETCH_THIN explorer pages do not override that proof. Ineligible only if a usable source shows coordinated multi-wallet farming. Contested only if neither proof is present. Do not invent transactions or identity.",
    project: "eligible-bond",
    evidence:
      "https://www.coindesk.com/tech/2024/11/11/ethereums-ens-identity-system-set-to-launch-own-layer-2-blockchain\nhttps://en.wikipedia.org/wiki/Vitalik_Buterin",
  },
  ineligible: {
    wallet: "0xfe7101d155eb11640e5a4bf342cd066dce51e9e3",
    title: "Hop Airdrop Cluster Funding Policy",
    body: "Ineligible if a usable fetched source identifies the exact target wallet as a parent/hub that funded multiple child wallets or as an address in a published sybil-attacker report. Eligible only if a usable source names a unique human and connects them to this wallet with no cluster evidence. Contested only if neither is shown. Do not invent transactions or identity.",
    project: "ineligible-bond",
    evidence:
      "https://api.github.com/repos/hop-protocol/hop-airdrop/issues/239\nhttps://raw.githubusercontent.com/hop-protocol/hop-airdrop/master/README.md",
  },
  contested: {
    wallet: "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9",
    title: "Solana Airdrop Uniqueness Policy",
    body: "This policy applies to the Solana airdrop. Eligible only if fetched pages identify a unique human and connect them to the target Solana wallet. Ineligible only if fetched pages show coordinated farming on Solana. Otherwise Contested. Do not invent transactions or identity.",
    project: "contested-bond",
    evidence: "https://en.wikipedia.org/wiki/Solana_(blockchain_platform)",
  },
};

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
  for (let attempt = 0; attempt < 4; attempt++) {
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
      await sleep(8000);
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

console.log("smoke account", account.address);
execSync(
  `genlayer account send --account sybil-court-deploy ${account.address} 1gen`,
  { stdio: "inherit" },
);

const snapshot = {};
for (const [name, spec] of Object.entries(ROUNDS)) {
  console.log("=== submit", name, "===");
  const policyHash = await writeAndWait(
    "publish_policy",
    [spec.title, spec.body, spec.project, "accepted"],
    0n,
    40,
    3000,
  );
  const policies = asRecord(await call("list_policy_ids"));
  const policyId = policies.last_policy_id;
  const submitHash = await writeAndWait(
    "submit_case",
    [spec.wallet, policyId, spec.evidence, BOND],
    BOND,
    40,
    3000,
  );
  const cases = asRecord(await call("list_case_ids"));
  const caseId = cases.last_case_id;
  const locked = asRecord(await call("get_bond_status", [caseId]));
  snapshot[name] = { policyHash, submitHash, policyId, caseId, locked };
  console.log("locked", JSON.stringify(locked));
}

for (const name of ["eligible", "ineligible", "contested"]) {
  console.log("=== judge", name, "===");
  const row = snapshot[name];
  row.judgeHash = await writeAndWait("judge_case", [row.caseId], 0n, 180, 5000);
  row.bond = asRecord(await call("get_bond_status", [row.caseId]));
  row.verdict = asRecord(await call("get_verdict", [row.caseId]));
  console.log("outcome", row.verdict?.verdict?.outcome, row.bond);
}

const eligibleCheck = asRecord(
  await call("is_eligible", [ROUNDS.eligible.wallet]),
);
const ineligibleCheck = asRecord(
  await call("is_eligible", [ROUNDS.ineligible.wallet]),
);
const treasuryAfterFirst = asRecord(await call("get_treasury"));
const creditAfterFirst = asRecord(await call("get_credit", [account.address]));

const contested = snapshot.contested;
if (contested.bond.appeal_window_open) {
  console.log("=== appeal contested ===");
  contested.appealHash = await writeAndWait(
    "file_appeal",
    [contested.caseId, "Second-round review of the incomplete Solana record.", APPEAL_BOND],
    APPEAL_BOND,
    40,
    3000,
  );
  contested.appealJudgeHash = await writeAndWait(
    "judge_appeal",
    [contested.caseId],
    0n,
    180,
    5000,
  );
  contested.bondAfterAppeal = asRecord(
    await call("get_bond_status", [contested.caseId]),
  );
  contested.appealVerdict = asRecord(await call("get_verdict", [contested.caseId]));
}

const out = {
  contract: ADDRESS,
  account: account.address,
  eligibleCheck,
  ineligibleCheck,
  treasuryAfterFirst,
  creditAfterFirst,
  treasuryFinal: asRecord(await call("get_treasury")),
  creditFinal: asRecord(await call("get_credit", [account.address])),
  economics: asRecord(await call("get_economics")),
  snapshot,
};
console.log(JSON.stringify(out, null, 2));

import { execSync } from "node:child_process";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const ADDRESS = "0x114F72F1b65f60d8ed9244B573F0c7F3a980814B";
const BOND = 10n ** 16n;
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
  await sleep(15_000);
  const hash = await write.writeContract({
    address: ADDRESS,
    functionName,
    args,
    value,
  });
  console.log(functionName, hash);
  let lastError = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const receipt = await read.waitForTransactionReceipt({
        hash,
        status: TransactionStatus.FINALIZED,
        interval,
        retries,
      });
      const failure = leaderFailure(receipt);
      if (failure) throw new Error(failure);
      console.log(functionName, "FINALIZED");
      return hash;
    } catch (error) {
      lastError = error;
      console.log("receipt", attempt + 1, error.message);
      await sleep(20_000);
    }
  }
  throw lastError;
}

async function call(fn, args = []) {
  await sleep(3000);
  return asRecord(
    await read.readContract({
      address: ADDRESS,
      functionName: fn,
      args,
      jsonSafeReturn: true,
    }),
  );
}

const title = "Public Figure Wallet Uniqueness Policy";
const body = [
  "Decide whether the target wallet is the public wallet of a unique named human.",
  "Eligible if ANY fetched SOURCE page (usable public text; not FETCH_FAILED; not FETCH_THIN) prints both (a) a unique human name such as Vitalik Buterin and (b) the exact target wallet address, listing that address as that person's wallet, public address, or EOA.",
  "A GitHub README, tutorial, documentation page, news article, or encyclopedia page is sufficient if the fetched text itself contains that name-to-address pair.",
  "Do not require the page to be a newspaper. Do not treat an example-wallet label as insufficient if it prints the name and the exact address together.",
  "FETCH_FAILED or FETCH_THIN explorer pages do not override Eligible once that pair appears in a usable SOURCE.",
  "Ineligible only if a usable SOURCE shows coordinated multi-wallet farming of this wallet.",
  "Contested only if no usable SOURCE prints the name-to-address pair and no usable SOURCE shows farming.",
  "Do not invent transactions, balances, or identity.",
].join(" ");
const evidence = [
  "https://raw.githubusercontent.com/NicolasGarzon0/ETHWalletInsight/main/README.md",
  "https://kay-is.github.io/web3-from-zero/01-read-address-data.html",
].join("\n");
const wallet = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

console.log("account", account.address);
execSync(
  `genlayer account send --account sybil-court-deploy ${account.address} 1gen`,
  { stdio: "inherit" },
);

const policyHash = await writeAndWait(
  "publish_policy",
  [title, body, "eligible-retry", "accepted"],
  0n,
  40,
  8000,
);
const policyId = (await call("list_policy_ids")).last_policy_id;
console.log("policy", policyId, policyHash);

const submitHash = await writeAndWait(
  "submit_case",
  [wallet, policyId, evidence, BOND, "", "", ""],
  BOND,
  40,
  8000,
);
const caseId = (await call("list_case_ids")).last_case_id;
console.log("case", caseId, submitHash);

const judgeHash = await writeAndWait("judge_case", [caseId], 0n, 90, 10000);
const docket = await call("get_case", [caseId]);
const verdict = asRecord(docket.verdict);
const eligible = await call("is_eligible", [wallet]);
const treasury = await call("get_treasury");
console.log(
  JSON.stringify(
    {
      policyId,
      caseId,
      policyHash,
      submitHash,
      judgeHash,
      outcome: verdict.outcome,
      summary: verdict.vote_summary,
      bondStatus: docket.bond_status,
      eligible: eligible.eligible,
      treasuryAtto: treasury.treasury_atto,
      verdictLength: String(verdict.text || "").length,
    },
    null,
    2,
  ),
);

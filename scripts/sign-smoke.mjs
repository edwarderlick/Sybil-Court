import { execSync } from "node:child_process";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const ADDRESS = process.argv[2] || process.env.NEXT_PUBLIC_SYBIL_COURT_ADDRESS;
const BOND = 10n ** 16n;
if (!ADDRESS) {
  throw new Error("Pass the new contract address as argv[2]");
}

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

async function writeAndWait(functionName, args, value, retries = 40, interval = 3000) {
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

function buildControlMessage(policyId, targetWallet, signer) {
  return [
    "Sybil Court control statement",
    "Network: GenLayer studionet (chain 61999)",
    `Contract: ${ADDRESS}`,
    `Policy ID: ${policyId}`,
    `Target wallet: ${targetWallet}`,
    `Signer: ${signer}`,
    "",
    "I control the signing key named above. I am submitting the target wallet for review under this policy.",
    "",
    "This signature proves control of the signing key only. It does not prove legal identity, uniqueness, humanity, or any on-chain history.",
  ].join("\n");
}

console.log("smoke account", account.address);
execSync(
  `genlayer account send --account sybil-court-deploy ${account.address} 1gen`,
  { stdio: "inherit" },
);

const policyHash = await writeAndWait(
  "publish_policy",
  [
    "Signed Control Statement Policy",
    "Eligible only if a fetched SOURCE page names a unique human and states that the exact target wallet is that person's wallet. A stored signature proves key control only and is never sufficient for Eligible. Ineligible only if a usable source shows coordinated multi-wallet farming. Otherwise Contested. Do not invent transactions or identity.",
    "control-statement",
    "accepted",
  ],
  0n,
);
const policies = asRecord(await call("list_policy_ids"));
const policyId = policies.last_policy_id;
console.log("policy", policyId, policyHash);

const unsignedHash = await writeAndWait(
  "submit_case",
  [
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    policyId,
    "https://en.wikipedia.org/wiki/Vitalik_Buterin",
    BOND,
    "",
    "",
    "",
  ],
  BOND,
);
const unsignedId = asRecord(await call("list_case_ids")).last_case_id;
const unsignedCase = asRecord(await call("get_case", [unsignedId]));
console.log("unsigned", unsignedId, unsignedHash, unsignedCase.control_statement);

const message = buildControlMessage(policyId, account.address, account.address);
const signature = await account.signMessage({ message });
const signedHash = await writeAndWait(
  "submit_case",
  [
    account.address,
    policyId,
    "https://en.wikipedia.org/wiki/Ethereum",
    BOND,
    message,
    signature,
    account.address,
  ],
  BOND,
);
const signedId = asRecord(await call("list_case_ids")).last_case_id;
const signedCase = asRecord(await call("get_case", [signedId]));
console.log("signed", signedId, signedHash, signedCase.control_statement);

const judgeHash = await writeAndWait("judge_case", [signedId], 0n, 180, 5000);
const judged = asRecord(await call("get_case", [signedId]));
const verdict = asRecord(judged.verdict);
console.log(
  JSON.stringify(
    {
      address: ADDRESS,
      unsignedId,
      signedId,
      judgeHash,
      control: judged.control_statement,
      outcome: verdict.outcome,
      verdictMentionsSignature: String(verdict.text || "")
        .toLowerCase()
        .includes("signature"),
      verdictLength: String(verdict.text || "").length,
    },
    null,
    2,
  ),
);

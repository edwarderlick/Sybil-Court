import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const ADDRESS = "0xFCA5d6960da9833f241c98f5677a0284534B7723";
const account = createAccount();
const write = createClient({ chain: studionet, account });
const read = createClient({ chain: studionet });

const ROUNDS = {
  eligible: {
    wallet: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    title: "Public Figure Wallet Uniqueness Policy",
    body: [
      "Decide whether the target wallet is operated by a unique named human.",
      "Eligible if any fetched SOURCE page (usable public text, not FETCH_FAILED and not FETCH_THIN) names a unique human and states that the exact target wallet is that person's wallet or public address.",
      "A news article or encyclopedia page that prints both the person's name and the exact target address is sufficient proof of that connection.",
      "FETCH_FAILED or FETCH_THIN explorer fallbacks do not override Eligible once that name-to-wallet connection appears in a usable source.",
      "Ineligible only if a usable fetched source itself shows coordinated multi-wallet farming or cluster control of this wallet.",
      "Contested only if no usable source names a unique human and connects that human to the exact target wallet, and no usable source shows cluster or farming behavior.",
      "Do not invent transactions, balances, or identity claims.",
    ].join(" "),
    project: "eligible-proof",
    evidence: [
      "https://www.coindesk.com/tech/2024/11/11/ethereums-ens-identity-system-set-to-launch-own-layer-2-blockchain",
      "https://en.wikipedia.org/wiki/Vitalik_Buterin",
    ].join("\n"),
  },
  ineligible: {
    wallet: "0xfe7101d155eb11640e5a4bf342cd066dce51e9e3",
    title: "Hop Airdrop Cluster Funding Policy",
    body: [
      "Decide whether the target wallet is part of a coordinated sybil or cluster-funding operation.",
      "Ineligible if a usable fetched source identifies the exact target wallet as a parent/hub that funded multiple child wallets, or as an address in a published sybil-attacker report describing one-to-many gas funding, matching amounts, or shared child activity.",
      "A GitHub issue or project README that names the exact target wallet in that cluster context is sufficient.",
      "FETCH_FAILED or FETCH_THIN explorer fallbacks do not override Ineligible once that cluster evidence appears in a usable source.",
      "Eligible only if a usable fetched source names a unique human operator and connects that person to this exact wallet, with no cluster evidence.",
      "Contested only if no usable source shows cluster or farming behavior and no usable source connects a unique human to the wallet.",
      "Do not invent transactions, balances, or identity claims.",
    ].join(" "),
    project: "ineligible-proof",
    evidence: [
      "https://api.github.com/repos/hop-protocol/hop-airdrop/issues/239",
      "https://raw.githubusercontent.com/hop-protocol/hop-airdrop/master/README.md",
    ].join("\n"),
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

async function writeAndWait(functionName, args, retries, interval) {
  const hash = await write.writeContract({
    address: ADDRESS,
    functionName,
    args,
    value: 0n,
  });
  console.log(`${functionName} hash ${hash}`);
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

async function runRound(name) {
  const spec = ROUNDS[name];
  if (!spec) throw new Error("unknown round " + name);
  console.log("===", name, "===");
  const policyHash = await writeAndWait(
    "publish_policy",
    [spec.title, spec.body, spec.project, "accepted"],
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
    [spec.wallet, policyId, spec.evidence, 0n],
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
  return {
    chain: name,
    account: account.address,
    contract: ADDRESS,
    policyId,
    caseId,
    wallet: spec.wallet,
    policyHash,
    submitHash,
    judgeHash,
    verdict,
  };
}

const wanted = process.argv.slice(2);
const names = wanted.length > 0 ? wanted : ["eligible", "ineligible"];
const results = [];
for (const name of names) {
  results.push(await runRound(name));
}
console.log(JSON.stringify(results, null, 2));

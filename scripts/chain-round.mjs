import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const ADDRESS = "0xFCA5d6960da9833f241c98f5677a0284534B7723";
const account = createAccount();
const write = createClient({ chain: studionet, account });
const read = createClient({ chain: studionet });

const ROUNDS = {
  solana: {
    wallet: "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9",
    title: "Solana Airdrop Uniqueness Policy",
    body: "This policy applies to the Solana airdrop on the Solana network. Eligible only if fetched public pages clearly identify a unique human operator and connect that operator to the target Solana wallet. Ineligible only if fetched Solana explorer pages or user links clearly show coordinated multi-wallet farming or cluster control on Solana. If sources fail, are thin, or do not connect the wallet to a unique operator on Solana, the outcome is Contested. Do not invent transactions, balances, or identity claims.",
    project: "solana-airdrop",
    evidence: "https://en.wikipedia.org/wiki/Solana_(blockchain_platform)",
  },
  sui: {
    wallet: "0x307784044da0dc83b942999821fafa0740dc3584457d89f4aa0820b3e210c995",
    title: "Sui Airdrop Uniqueness Policy",
    body: "This policy applies to the Sui airdrop on the Sui network. Eligible only if fetched public pages clearly identify a unique human operator and connect that operator to the target Sui wallet. Ineligible only if fetched Sui explorer pages or user links clearly show coordinated multi-wallet farming or cluster control on Sui. If sources fail, are thin, or do not connect the wallet to a unique operator on Sui, the outcome is Contested. Do not invent transactions, balances, or identity claims.",
    project: "sui-airdrop",
    evidence: "https://en.wikipedia.org/wiki/Sui_(blockchain_platform)",
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
  if (!spec) {
    throw new Error("unknown round " + name);
  }
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
const names = wanted.length > 0 ? wanted : ["solana", "sui"];
const results = [];
for (const name of names) {
  results.push(await runRound(name));
}
console.log(JSON.stringify(results, null, 2));

import {
  ExecutionResult,
  TransactionStatus,
  type GenLayerTransaction,
  type Hash,
} from "genlayer-js/types";
import type { Account, Address } from "viem";
import {
  SYBIL_COURT_ADDRESS,
  getInjectedProvider,
  getReadClient,
  getWriteClient,
} from "./genlayer";

export type ContractPolicy = {
  found: boolean;
  id: string;
  publisher: string;
  title: string;
  body: string;
  project: string;
  source: string;
};

export type ContractVerdict = {
  issued: boolean;
  outcome: string;
  text: string;
  vote_summary: string;
};

export type ContractAppeal = {
  filed: boolean;
  filer: string;
  reason: string;
  bond_atto: string;
  verdict: ContractVerdict;
};

export type ContractCase = {
  found: boolean;
  id: string;
  submitter: string;
  wallet: string;
  policy_id: string;
  bond_atto: string;
  status: string;
  evidence_blob: string;
  evidence_links: string[];
  verdict: ContractVerdict;
  appeal: ContractAppeal;
};

export type IdList = {
  count: string;
  last_id: string;
  ids: string[];
};

export type WriteResult = {
  hash: Hash;
  receipt: GenLayerTransaction;
};

const WRITE_WAIT = {
  status: TransactionStatus.FINALIZED,
  interval: 3_000,
  retries: 40,
} as const;

const JUDGE_WAIT = {
  status: TransactionStatus.FINALIZED,
  interval: 5_000,
  retries: 180,
} as const;

function asRecord(value: unknown): Record<string, unknown> {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value && typeof value === "object") return value as Record<string, unknown>;
  return {};
}

function asText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return String(value);
}

function asBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return Boolean(value);
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asText(item)).filter((item) => item !== "");
}

export function formatContractError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    if (typeof record.shortMessage === "string") return record.shortMessage;
    if (typeof record.message === "string") return record.message;
    if (record.data && typeof record.data === "object") {
      const data = record.data as Record<string, unknown>;
      if (typeof data.message === "string") return data.message;
    }
  }
  return String(error);
}

function parseVerdict(value: unknown): ContractVerdict {
  const record = asRecord(value);
  return {
    issued: asBool(record.issued),
    outcome: asText(record.outcome),
    text: asText(record.text),
    vote_summary: asText(record.vote_summary),
  };
}

function parseAppeal(value: unknown): ContractAppeal {
  const record = asRecord(value);
  return {
    filed: asBool(record.filed),
    filer: asText(record.filer),
    reason: asText(record.reason),
    bond_atto: asText(record.bond_atto),
    verdict: parseVerdict(record.verdict),
  };
}

function parsePolicy(value: unknown): ContractPolicy {
  const record = asRecord(value);
  return {
    found: asBool(record.found),
    id: asText(record.id),
    publisher: asText(record.publisher),
    title: asText(record.title),
    body: asText(record.body),
    project: asText(record.project),
    source: asText(record.source),
  };
}

function parseCase(value: unknown): ContractCase {
  const record = asRecord(value);
  return {
    found: asBool(record.found),
    id: asText(record.id),
    submitter: asText(record.submitter),
    wallet: asText(record.wallet),
    policy_id: asText(record.policy_id),
    bond_atto: asText(record.bond_atto),
    status: asText(record.status),
    evidence_blob: asText(record.evidence_blob),
    evidence_links: asStringList(record.evidence_links),
    verdict: parseVerdict(record.verdict),
    appeal: parseAppeal(record.appeal),
  };
}

function parseIdList(value: unknown, lastKey: string): IdList {
  const record = asRecord(value);
  return {
    count: asText(record.count),
    last_id: asText(record[lastKey]),
    ids: asStringList(record.ids),
  };
}

async function readMethod(functionName: string, args: unknown[] = []) {
  const client = getReadClient();
  return client.readContract({
    address: SYBIL_COURT_ADDRESS,
    functionName,
    args: args as never,
    jsonSafeReturn: true,
  });
}

function leaderFailure(receipt: GenLayerTransaction): string | null {
  if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
    return "Contract execution finished with an error.";
  }
  const raw = receipt as unknown as Record<string, unknown>;
  const consensus = asRecord(raw.consensus_data ?? raw.consensusData);
  const leaders = consensus.leader_receipt ?? consensus.leaderReceipt;
  const first = Array.isArray(leaders) ? leaders[0] : leaders;
  const leader = asRecord(first);
  const execution = asText(leader.execution_result).toUpperCase();
  if (execution === "ERROR") {
    const genvm = asRecord(leader.genvm_result);
    const stderr = asText(genvm.stderr);
    const result = asRecord(leader.result);
    const payload = asText(result.payload);
    return [stderr, payload].filter(Boolean).join("\n") || "Leader execution error";
  }
  return null;
}

async function sendWrite(
  account: Address | Account,
  functionName: string,
  args: unknown[],
  wait: typeof WRITE_WAIT | typeof JUDGE_WAIT,
): Promise<WriteResult> {
  const provider = getInjectedProvider();
  const client = getWriteClient(account, provider);
  if (typeof window !== "undefined") {
    await client.connect("studionet");
  }
  const hash = (await client.writeContract({
    address: SYBIL_COURT_ADDRESS,
    functionName,
    args: args as never,
    value: BigInt(0),
  })) as Hash;

  let receipt: GenLayerTransaction;
  try {
    receipt = await getReadClient().waitForTransactionReceipt({
      hash,
      status: wait.status,
      interval: wait.interval,
      retries: wait.retries,
    });
  } catch (error) {
    throw new Error(
      `${formatContractError(error)} Transaction ${hash} was submitted.`,
    );
  }

  const failure = leaderFailure(receipt);
  if (failure) {
    throw new Error(`${failure} Transaction ${hash}`);
  }
  return { hash, receipt };
}

export async function listPolicyIds(): Promise<IdList> {
  return parseIdList(await readMethod("list_policy_ids"), "last_policy_id");
}

export async function listCaseIds(): Promise<IdList> {
  return parseIdList(await readMethod("list_case_ids"), "last_case_id");
}

export async function getPolicy(policyId: string): Promise<ContractPolicy> {
  return parsePolicy(await readMethod("get_policy", [policyId]));
}

export async function getCase(caseId: string): Promise<ContractCase> {
  return parseCase(await readMethod("get_case", [caseId]));
}

export async function getVerdict(caseId: string) {
  const record = asRecord(await readMethod("get_verdict", [caseId]));
  return {
    found: asBool(record.found),
    id: asText(record.id),
    status: asText(record.status),
    verdict: parseVerdict(record.verdict),
    appeal_verdict: parseVerdict(record.appeal_verdict),
  };
}

export async function loadCourtSnapshot() {
  const [policies, cases] = await Promise.all([listPolicyIds(), listCaseIds()]);
  const policyRows = await Promise.all(policies.ids.map((id) => getPolicy(id)));
  const caseRows = await Promise.all(cases.ids.map((id) => getCase(id)));
  return {
    policies: policyRows.filter((item) => item.found),
    cases: caseRows.filter((item) => item.found),
    lastPolicyId: policies.last_id || null,
    lastCaseId: cases.last_id || null,
  };
}

export function publishPolicy(
  account: Address | Account,
  title: string,
  body: string,
  project: string,
  source: string,
) {
  return sendWrite(account, "publish_policy", [title, body, project, source], WRITE_WAIT);
}

export function submitCase(
  account: Address | Account,
  wallet: string,
  policyId: string,
  evidenceBlob: string,
  bondAtto: bigint,
) {
  return sendWrite(
    account,
    "submit_case",
    [wallet, policyId, evidenceBlob, bondAtto],
    WRITE_WAIT,
  );
}

export function fileAppeal(
  account: Address | Account,
  caseId: string,
  reason: string,
  bondAtto: bigint,
) {
  return sendWrite(account, "file_appeal", [caseId, reason, bondAtto], WRITE_WAIT);
}

export function judgeCase(account: Address | Account, caseId: string) {
  return sendWrite(account, "judge_case", [caseId], JUDGE_WAIT);
}

export function judgeAppeal(account: Address | Account, caseId: string) {
  return sendWrite(account, "judge_appeal", [caseId], JUDGE_WAIT);
}

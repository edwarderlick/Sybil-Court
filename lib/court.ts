import { parseEther } from "viem";
import type { ControlStatementView } from "./controlStatement";
import { featuredCase, policyDraft, submitPolicies } from "./content";
import type { ContractCase, ContractPolicy } from "./contract";

export type PolicySource = "seed" | "accepted" | "edited" | "original";

export type PolicyRecord = {
  id: string;
  title: string;
  body: string;
  project: string;
  source: PolicySource;
  seed?: boolean;
};

export type CaseStatusTone = "appeal" | "open" | "resolved" | "pending";

export type AppealRecord = {
  reason: string;
  stake: string;
};

export type CaseRecord = {
  id: string;
  docket: string;
  title: string;
  status: string;
  statusTone: CaseStatusTone;
  wallet: string;
  policyId: string;
  policyTitle: string;
  policyText: string;
  stake: string;
  stakeLabel: string;
  project?: string;
  projectImage?: string;
  reputation?: string;
  meterLabel?: string;
  meterValue?: string;
  windowSeconds?: number;
  filled?: number;
  verdict?: string[];
  verdictText?: string;
  voteSummary?: string;
  signature?: string;
  outcome?: string;
  evidence: string[];
  validator?: string;
  flagged?: string;
  sharedIps?: string;
  appealStake?: string;
  resolutionHash?: string;
  submitter?: string;
  seed?: boolean;
  appeal?: AppealRecord;
  bondStatus?: string;
  appealDeadline?: string;
  appealOpensAt?: string;
  appealWindowOpen?: boolean;
  registryEligible?: boolean;
  minAppealBond?: string;
  controlStatement?: ControlStatementView;
};

export const MIN_SUBMIT_BOND_ATTO = BigInt(10) ** BigInt(16);

export function appealWindowOpen(
  deadline: string,
  appealFiled: boolean,
  outcome: string,
): boolean {
  if (appealFiled || outcome !== "Contested" || !deadline) return false;
  const stamp = Date.parse(deadline);
  if (Number.isNaN(stamp)) return false;
  return Date.now() <= stamp;
}

export function formatDeadline(deadline: string): string {
  const stamp = Date.parse(deadline);
  if (Number.isNaN(stamp)) return deadline || "not open";
  return new Date(stamp).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

export function doubleBond(atto: string): string {
  try {
    return formatBond((BigInt(atto || "0") * BigInt(2)).toString());
  } catch {
    return formatBond(atto);
  }
}

export function policyDraftText() {
  return [
    policyDraft.title,
    "",
    ...policyDraft.sections.flatMap((section) => [
      section.heading,
      section.body,
      "",
    ]),
  ]
    .join("\n")
    .trim();
}

export function titleFromPolicyText(text: string, fallback = policyDraft.title) {
  const line = text
    .split("\n")
    .map((item) => item.trim())
    .find(Boolean);
  return line || fallback;
}

export const seedPolicies: PolicyRecord[] = submitPolicies.map((item) => ({
  id: item.id,
  title: item.title,
  body: item.body,
  project: item.tag,
  source: "seed",
  seed: true,
}));

export const seedCases: CaseRecord[] = [
  {
    id: featuredCase.id,
    docket: "A-9921",
    title: featuredCase.title,
    status: "Active Appeal",
    statusTone: "appeal",
    wallet: "0x71C...3E9A",
    policyId: "POL-ZK-001",
    policyTitle: featuredCase.policy,
    policyText: [
      featuredCase.policy,
      "",
      ...featuredCase.verdict,
      featuredCase.signature,
    ].join("\n"),
    stake: "15,000 USDC",
    stakeLabel: "STAKE AT RISK",
    project: "Arbitrum Defi",
    projectImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAXPoMuvUBiWWC6hGJI1oU12gbS13_X2RWFHJpB1yOl9GnSXGTOvmCnBpESiJlIN6AyHAkObrGPz6vGnfnblA28muahHS6zRVIh0bThX0f5k7Nd29qJEnQJhPu75lT0BVQW8tloZXv-nvGL1qIPfd0AQjOHG8cUfuZUCy15Y3pkOJykojKZwce5hdy-cT0VWoR8zYgyyBYQeYz1C2tdWTjKf9Q7_Bsztjt6d3Y5ADsAzaNkGnjon12G",
    reputation: "84/100 (Verified)",
    meterLabel: "RESOLUTION COUNTDOWN",
    windowSeconds: 4 * 3600 + 12 * 60 + 59,
    filled: 3,
    verdict: featuredCase.verdict,
    signature: featuredCase.signature,
    evidence: [],
    validator: featuredCase.validator,
    flagged: featuredCase.flagged,
    sharedIps: featuredCase.sharedIps,
    appealStake: featuredCase.appealStake,
    seed: true,
  },
  {
    id: "r-4402",
    docket: "R-4402",
    title: "0x4B2...8F1D",
    status: "Open Review",
    statusTone: "open",
    wallet: "0x4B2...8F1D",
    policyId: "POL-DF-042",
    policyTitle: "Liquidity Provider Anonymity Bounds",
    policyText:
      "Strict threshold policy for overlapping LP positions across designated automated market makers.",
    stake: "5,500 MATIC",
    stakeLabel: "STAKE AT RISK",
    project: "Polygon Social",
    projectImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDoPV9MRjxinxJ616qX_GPPumWXllyt4Thc4a_NucOEUfmk7o-5WgdrzZCqiXMbm6WrHH_PxI7Ri4suJE_-jEL5rqTbneAculeBLckOC2VO1RDlNl0KegCS8BCeYGFYzE3bsM-dqLYlmybHNXg6jc9OUnYqQpiZbzMAIkZXk7kkLU9p2ST3d98V4y4pbrdd2xmaMrdAmnOsRu-Ebl92B1ZWGC7Bi3H0VgR5b4efrBlHqzy4JNVZqQaJ",
    reputation: "Unverified (41/100)",
    meterLabel: "VALIDATOR CONSENSUS",
    meterValue: "42% REACHED",
    filled: 2,
    evidence: [],
    seed: true,
  },
  {
    id: "s-1108",
    docket: "S-1108",
    title: "0x99F...2C11",
    status: "Resolved (Sybil)",
    statusTone: "resolved",
    wallet: "0x99F...2C11",
    policyId: "POL-ZK-001",
    policyTitle: "Standard Sybil Resistance Framework",
    policyText:
      "Base policy governing single-entity multi-wallet interactions within standard rollup environments.",
    stake: "120,000 OP",
    stakeLabel: "STAKE SLASHED",
    resolutionHash: "0xdef...a1b2",
    evidence: [],
    seed: true,
  },
];

export function findCase(cases: CaseRecord[], id: string) {
  if (id === "a-9921") {
    return cases.find((item) => item.id === featuredCase.id) ?? null;
  }
  return cases.find((item) => item.id === id) ?? null;
}

export function nextPolicyId(policies: PolicyRecord[]) {
  const count = policies.filter((item) => !item.seed).length + 1;
  return `POL-SC-${String(count).padStart(3, "0")}`;
}

export function nextCaseId(cases: CaseRecord[]) {
  const count = cases.filter((item) => !item.seed).length + 1;
  return `sc-${String(count).padStart(3, "0")}`;
}

export function parseBondAtto(raw: string): bigint {
  const cleaned = raw.replace(/,/g, "").trim().split(/\s+/)[0] ?? "0";
  if (!cleaned || cleaned === "0") return BigInt(0);
  try {
    return parseEther(cleaned);
  } catch {
    return BigInt(0);
  }
}

export function formatBond(atto: string): string {
  try {
    const value = BigInt(atto || "0");
    if (value === BigInt(0)) return "0 GEN";
    const whole = value / BigInt(10) ** BigInt(18);
    const frac = (value % BigInt(10) ** BigInt(18))
      .toString()
      .padStart(18, "0")
      .replace(/0+$/, "");
    return frac ? `${whole}.${frac} GEN` : `${whole} GEN`;
  } catch {
    return `${atto} atto`;
  }
}

function statusTone(status: string): CaseStatusTone {
  if (status === "appealed") return "appeal";
  if (status === "judged" || status === "appeal_judged") return "resolved";
  if (status === "submitted") return "pending";
  return "open";
}

function statusLabel(item: ContractCase): string {
  if (item.status === "submitted") return "Open Review";
  if (item.status === "judged") {
    return item.verdict.outcome
      ? `Resolved (${item.verdict.outcome})`
      : "Resolved";
  }
  if (item.status === "appealed") return "Active Appeal";
  if (item.status === "appeal_judged") {
    return item.appeal.verdict.outcome
      ? `Appeal Resolved (${item.appeal.verdict.outcome})`
      : "Appeal Resolved";
  }
  return item.status;
}

export function policyFromContract(item: ContractPolicy): PolicyRecord {
  const source =
    item.source === "accepted" ||
    item.source === "edited" ||
    item.source === "original"
      ? item.source
      : "accepted";
  return {
    id: item.id,
    title: item.title,
    body: item.body,
    project: item.project,
    source,
  };
}

export function caseFromContract(
  item: ContractCase,
  policy?: PolicyRecord | ContractPolicy,
  registryEligible = false,
): CaseRecord {
  const activeVerdict = item.appeal.verdict.issued
    ? item.appeal.verdict
    : item.verdict;
  const verdictText = activeVerdict.issued ? activeVerdict.text : "";
  const bondStatus = item.bond_status || (item.status === "submitted" ? "locked" : "");
  const windowOpen = appealWindowOpen(
    item.appeal_deadline,
    item.appeal.filed,
    item.verdict.outcome,
  );
  return {
    id: item.id,
    docket: item.id,
    title: item.wallet,
    status: statusLabel(item),
    statusTone: statusTone(item.status),
    wallet: item.wallet,
    policyId: item.policy_id,
    policyTitle: policy?.title ?? item.policy_id,
    policyText: policy?.body ?? "",
    stake: formatBond(item.bond_atto),
    stakeLabel:
      bondStatus === "returned"
        ? "BOND RETURNED (CREDIT)"
        : bondStatus === "slashed"
          ? "BOND SLASHED TO TREASURY"
          : bondStatus === "locked"
            ? "BOND LOCKED"
            : "BOND ON RECORD",
    project: policy?.project,
    meterLabel:
      item.status === "appealed"
        ? "APPEAL PENDING"
        : windowOpen
          ? "APPEAL WINDOW OPEN"
          : item.verdict.issued
            ? "JUDGMENT FINALIZED"
            : "AWAITING JUDGMENT",
    filled: item.verdict.issued ? 3 : 1,
    verdict: verdictText ? [verdictText] : [],
    verdictText: verdictText || undefined,
    voteSummary: activeVerdict.vote_summary || undefined,
    outcome: activeVerdict.issued ? activeVerdict.outcome : undefined,
    signature: activeVerdict.issued
      ? `Outcome: ${activeVerdict.outcome}`
      : undefined,
    evidence: item.evidence_links,
    flagged: item.wallet,
    submitter: item.submitter,
    resolutionHash: item.verdict.issued ? item.id : undefined,
    appeal: item.appeal.filed
      ? { reason: item.appeal.reason, stake: formatBond(item.appeal.bond_atto) }
      : undefined,
    appealStake: doubleBond(item.bond_atto),
    bondStatus,
    appealDeadline: item.appeal_deadline,
    appealOpensAt: item.appeal_opens_at,
    appealWindowOpen: windowOpen,
    registryEligible,
    minAppealBond: doubleBond(item.bond_atto),
    controlStatement: item.control_statement,
  };
}

export function encodeEvidenceBlob(links: string[]): string {
  return links.map((item) => item.trim()).filter(Boolean).join("\n");
}


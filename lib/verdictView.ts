import type { CaseRecord } from "./court";

export type EvidenceItem = {
  url: string;
  status: string;
  note: string;
};

export type VerdictView = {
  outcome: string;
  summary: string;
  evidence: EvidenceItem[];
  why: string;
  strengthen: string[];
};

function normalizeOutcome(raw?: string) {
  const token = (raw ?? "").trim().toLowerCase();
  if (token.includes("eligible") && !token.includes("ineligible")) return "Eligible";
  if (token.includes("ineligible")) return "Ineligible";
  if (token.includes("contested")) return "Contested";
  return "";
}

function extractUrls(text: string): string[] {
  const found: string[] = [];
  const re = /https?:\/\/[^\s)>\]]+/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    const url = match[0].replace(/[.,;:]+$/, "");
    if (!found.includes(url)) found.push(url);
  }
  return found;
}

function statusFor(url: string, text: string): { status: string; note: string } {
  const idx = text.indexOf(url);
  const window = idx === -1 ? text : text.slice(Math.max(0, idx - 180), idx + url.length + 280);
  const low = window.toLowerCase();
  if (low.includes("fetch_failed") || low.includes("fetch failed") || low.includes("dns")) {
    return { status: "Failed", note: "Fetch failed. No usable content from this URL." };
  }
  if (low.includes("fetch_thin") || low.includes("challenge") || low.includes("interstitial")) {
    return { status: "Thin", note: "Page was thin or blocked by a challenge wall." };
  }
  if (low.includes("fetched") || low.includes("source ")) {
    return { status: "Fetched", note: "Readable public content was retrieved." };
  }
  return { status: "Listed", note: "Submitted as evidence." };
}

function extractWhy(text: string, summary: string, outcome: string): string {
  const gaps = text.match(/##\s*4\)\s*Gaps([\s\S]*?)(?:##\s*5\)|$)/i);
  if (gaps?.[1]?.trim()) {
    return gaps[1].replace(/\n{3,}/g, "\n\n").trim();
  }
  const conclusion = text.match(/##\s*5\)\s*Conclusion([\s\S]*?)$/i);
  if (conclusion?.[1]?.trim()) {
    return conclusion[1].replace(/\n{3,}/g, "\n\n").trim();
  }
  if (summary) return summary;
  if (outcome === "Contested") {
    return "The fetched record is incomplete under the policy. No invented facts were added.";
  }
  return "";
}

function strengthenFromPolicy(policyText: string, outcome: string): string[] {
  if (outcome !== "Contested" && outcome !== "Ineligible" && outcome !== "") {
    return [];
  }
  const policy = policyText.toLowerCase();
  const hints: string[] = [];
  if (
    policy.includes("unique") ||
    policy.includes("operator") ||
    policy.includes("connect")
  ) {
    hints.push(
      "A public page that names this exact wallet and a unique operator (official site, documented profile, or ENS record the court can fetch).",
    );
  }
  if (policy.includes("ens")) {
    hints.push("A resolvable ENS name or ENS profile page that the court can load without a login wall.");
  } else if (policy.includes("unique") || policy.includes("identity")) {
    hints.push(
      "A durable public identity link (ENS, project docs, or a profile that repeats the wallet address in readable HTML).",
    );
  }
  if (
    policy.includes("fail") ||
    policy.includes("thin") ||
    policy.includes("contested")
  ) {
    hints.push(
      "Sources that load as readable public HTML, not challenge walls, empty bodies, or failed DNS.",
    );
  }
  if (policy.includes("farm") || policy.includes("cluster") || policy.includes("sybil")) {
    hints.push(
      "If arguing Ineligible: public pages that themselves show coordinated multi-wallet or farming behavior.",
    );
  }
  if (hints.length === 0) {
    hints.push(
      "Additional public HTTPS pages that speak directly to the policy clauses stored on this docket.",
    );
  }
  return hints;
}

export function buildVerdictView(record: CaseRecord): VerdictView | null {
  if (!record.verdictText && !record.voteSummary && !record.outcome) {
    return null;
  }
  const text = record.verdictText ?? "";
  const outcome =
    normalizeOutcome(record.outcome) ||
    normalizeOutcome(record.signature) ||
    normalizeOutcome(record.status) ||
    "Contested";
  const urls = [
    ...record.evidence,
    ...extractUrls(text),
  ].filter((url, index, all) => all.indexOf(url) === index);

  return {
    outcome,
    summary: record.voteSummary || extractWhy(text, "", outcome),
    evidence: urls.map((url) => {
      const meta = statusFor(url, text);
      return { url, status: meta.status, note: meta.note };
    }),
    why: extractWhy(text, record.voteSummary ?? "", outcome),
    strengthen: strengthenFromPolicy(record.policyText, outcome),
  };
}

import { SYBIL_COURT_ADDRESS } from "./genlayer";

export type ControlStatement = {
  message: string;
  signature: string;
  signer: string;
};

export type ControlStatementView = ControlStatement & {
  present: boolean;
  signerMatchesTarget: boolean;
  messageNamesWallet: boolean;
  messageNamesPolicy: boolean;
};

export function emptyControlStatement(): ControlStatement {
  return { message: "", signature: "", signer: "" };
}

export function buildControlMessage(input: {
  policyId: string;
  targetWallet: string;
  signer: string;
  contract?: string;
}): string {
  return [
    "Sybil Court control statement",
    "Network: GenLayer studionet (chain 61999)",
    `Contract: ${input.contract ?? SYBIL_COURT_ADDRESS}`,
    `Policy ID: ${input.policyId}`,
    `Target wallet: ${input.targetWallet}`,
    `Signer: ${input.signer}`,
    "",
    "I control the signing key named above. I am submitting the target wallet for review under this policy.",
    "",
    "This signature proves control of the signing key only. It does not prove legal identity, uniqueness, humanity, or any on-chain history.",
  ].join("\n");
}

export function signerMatchesTarget(signer: string, target: string): boolean {
  const left = signer.trim().toLowerCase();
  const right = target.trim().toLowerCase();
  return left !== "" && left === right;
}

export function parseControlStatement(value: unknown): ControlStatementView {
  const record =
    value instanceof Map
      ? Object.fromEntries(value)
      : value && typeof value === "object"
        ? (value as Record<string, unknown>)
        : {};
  const message = String(record.message ?? "");
  const signature = String(record.signature ?? "");
  const signer = String(record.signer ?? "");
  const present =
    record.present === true ||
    (typeof record.present === "string" &&
      record.present.toLowerCase() === "true") ||
    signature.trim() !== "";
  return {
    present,
    message,
    signature,
    signer,
    signerMatchesTarget:
      record.signer_matches_target === true ||
      String(record.signer_matches_target ?? "").toLowerCase() === "true",
    messageNamesWallet:
      record.message_names_wallet === true ||
      String(record.message_names_wallet ?? "").toLowerCase() === "true",
    messageNamesPolicy:
      record.message_names_policy === true ||
      String(record.message_names_policy ?? "").toLowerCase() === "true",
  };
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAccount } from "wagmi";
import {
  fileAppeal as writeFileAppeal,
  formatContractError,
  judgeAppeal as writeJudgeAppeal,
  judgeCase as writeJudgeCase,
  loadCourtSnapshot,
  publishPolicy as writePublishPolicy,
  submitCase as writeSubmitCase,
} from "@/lib/contract";
import {
  type AppealRecord,
  type CaseRecord,
  type PolicyRecord,
  type PolicySource,
  caseFromContract,
  encodeEvidenceBlob,
  findCase,
  parseBondAtto,
  policyFromContract,
  titleFromPolicyText,
} from "@/lib/court";

type CourtState = {
  address: string | null;
  chainId: number | null;
  policies: PolicyRecord[];
  cases: CaseRecord[];
  activeCaseId: string | null;
  lastPolicyId: string | null;
  lastCaseId: string | null;
  lastTxHash: string | null;
  pending: string | null;
  lastError: string | null;
  loading: boolean;
};

type PublishInput = {
  body: string;
  source: Exclude<PolicySource, "seed">;
  title?: string;
  project?: string;
};

type SubmitInput = {
  policyId: string;
  wallet: string;
  evidence: string[];
  stakeAmount: string;
  stakeToken: string;
  controlMessage?: string;
  controlSignature?: string;
  controlSigner?: string;
};

type CourtContextValue = CourtState & {
  publishPolicy: (input: PublishInput) => Promise<PolicyRecord>;
  submitCase: (input: SubmitInput) => Promise<CaseRecord>;
  fileAppeal: (caseId: string, appeal: AppealRecord) => Promise<void>;
  judgeCase: (caseId: string) => Promise<CaseRecord>;
  judgeAppeal: (caseId: string) => Promise<CaseRecord>;
  refresh: () => Promise<void>;
  setActiveCase: (id: string | null) => void;
  getCase: (id: string) => CaseRecord | null;
};

const CourtContext = createContext<CourtContextValue | null>(null);

function requireAddress(address: string | undefined): `0x${string}` {
  if (!address) {
    throw new Error("Connect a wallet before writing to the contract.");
  }
  return address as `0x${string}`;
}

export function CourtProvider({ children }: { children: React.ReactNode }) {
  const { address, chainId } = useAccount();
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [lastPolicyId, setLastPolicyId] = useState<string | null>(null);
  const [lastCaseId, setLastCaseId] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applySnapshot = useCallback(
    (snapshot: Awaited<ReturnType<typeof loadCourtSnapshot>>) => {
      const nextPolicies = snapshot.policies.map(policyFromContract);
      const policyMap = new Map(nextPolicies.map((item) => [item.id, item]));
      const eligibleSet = new Set(
        (snapshot.eligibility ?? [])
          .filter((item) => item.eligible)
          .map((item) => item.wallet.trim().toLowerCase()),
      );
      setPolicies(nextPolicies);
      setCases(
        snapshot.cases.map((item) =>
          caseFromContract(
            item,
            policyMap.get(item.policy_id),
            eligibleSet.has(item.wallet.trim().toLowerCase()),
          ),
        ),
      );
      setLastPolicyId(snapshot.lastPolicyId);
      setLastCaseId(snapshot.lastCaseId);
    },
    [],
  );

  const refresh = useCallback(async () => {
    const snapshot = await loadCourtSnapshot();
    applySnapshot(snapshot);
  }, [applySnapshot]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadCourtSnapshot()
      .then((snapshot) => {
        if (!cancelled) applySnapshot(snapshot);
      })
      .catch((error) => {
        if (!cancelled) setLastError(formatContractError(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applySnapshot]);

  const runWrite = useCallback(
    async <T,>(label: string, work: () => Promise<T>): Promise<T> => {
      setPending(label);
      setLastError(null);
      try {
        return await work();
      } catch (error) {
        const message = formatContractError(error);
        setLastError(message);
        throw error instanceof Error ? error : new Error(message);
      } finally {
        setPending(null);
      }
    },
    [],
  );

  const publishPolicy = useCallback(
    (input: PublishInput) =>
      runWrite("Publishing policy…", async () => {
        const sender = requireAddress(address);
        const body = input.body.trim();
        const title = input.title || titleFromPolicyText(body);
        const result = await writePublishPolicy(
          sender,
          title,
          body,
          input.project || "Operator published",
          input.source,
        );
        setLastTxHash(result.hash);
        await refresh();
        const snapshot = await loadCourtSnapshot();
        const created = snapshot.policies.find(
          (item) => item.id === snapshot.lastPolicyId,
        );
        if (!created) {
          throw new Error(
            `Policy write landed (${result.hash}) but the contract did not return a new policy.`,
          );
        }
        return policyFromContract(created);
      }),
    [address, refresh, runWrite],
  );

  const submitCase = useCallback(
    (input: SubmitInput) =>
      runWrite("Submitting case…", async () => {
        const sender = requireAddress(address);
        const wallet = input.wallet.trim();
        const result = await writeSubmitCase(
          sender,
          wallet,
          input.policyId,
          encodeEvidenceBlob(input.evidence),
          parseBondAtto(`${input.stakeAmount} ${input.stakeToken}`),
          input.controlMessage ?? "",
          input.controlSignature ?? "",
          input.controlSigner ?? "",
        );
        setLastTxHash(result.hash);
        await refresh();
        const snapshot = await loadCourtSnapshot();
        const created = snapshot.cases.find(
          (item) => item.id === snapshot.lastCaseId,
        );
        if (!created) {
          throw new Error(
            `Case write landed (${result.hash}) but the contract did not return a new case.`,
          );
        }
        const policy =
          snapshot.policies.find((item) => item.id === created.policy_id) ??
          policies.find((item) => item.id === created.policy_id);
        const record = caseFromContract(created, policy, false);
        setActiveCaseId(record.id);
        return record;
      }),
    [address, policies, refresh, runWrite],
  );

  const fileAppeal = useCallback(
    (caseId: string, appeal: AppealRecord) =>
      runWrite("Filing appeal…", async () => {
        const sender = requireAddress(address);
        const result = await writeFileAppeal(
          sender,
          caseId,
          appeal.reason,
          parseBondAtto(appeal.stake),
        );
        setLastTxHash(result.hash);
        await refresh();
        setActiveCaseId(caseId);
      }),
    [address, refresh, runWrite],
  );

  const judgeCase = useCallback(
    (caseId: string) =>
      runWrite("Running judgment…", async () => {
        const sender = requireAddress(address);
        const result = await writeJudgeCase(sender, caseId);
        setLastTxHash(result.hash);
        await refresh();
        const snapshot = await loadCourtSnapshot();
        const updated = snapshot.cases.find((item) => item.id === caseId);
        if (!updated) {
          throw new Error(
            `Judgment landed (${result.hash}) but the case could not be reloaded.`,
          );
        }
        const policy = snapshot.policies.find(
          (item) => item.id === updated.policy_id,
        );
        const eligible = snapshot.eligibility?.some(
          (item) =>
            item.eligible &&
            item.wallet.trim().toLowerCase() ===
              updated.wallet.trim().toLowerCase(),
        );
        return caseFromContract(updated, policy, Boolean(eligible));
      }),
    [address, refresh, runWrite],
  );

  const judgeAppeal = useCallback(
    (caseId: string) =>
      runWrite("Running appeal judgment…", async () => {
        const sender = requireAddress(address);
        const result = await writeJudgeAppeal(sender, caseId);
        setLastTxHash(result.hash);
        await refresh();
        const snapshot = await loadCourtSnapshot();
        const updated = snapshot.cases.find((item) => item.id === caseId);
        if (!updated) {
          throw new Error(
            `Appeal judgment landed (${result.hash}) but the case could not be reloaded.`,
          );
        }
        const policy = snapshot.policies.find(
          (item) => item.id === updated.policy_id,
        );
        const eligible = snapshot.eligibility?.some(
          (item) =>
            item.eligible &&
            item.wallet.trim().toLowerCase() ===
              updated.wallet.trim().toLowerCase(),
        );
        return caseFromContract(updated, policy, Boolean(eligible));
      }),
    [address, refresh, runWrite],
  );

  const getCase = useCallback((id: string) => findCase(cases, id), [cases]);

  const value = useMemo<CourtContextValue>(
    () => ({
      address: address ?? null,
      chainId: chainId ?? null,
      policies,
      cases,
      activeCaseId,
      lastPolicyId,
      lastCaseId,
      lastTxHash,
      pending,
      lastError,
      loading,
      publishPolicy,
      submitCase,
      fileAppeal,
      judgeCase,
      judgeAppeal,
      refresh,
      setActiveCase: setActiveCaseId,
      getCase,
    }),
    [
      address,
      chainId,
      policies,
      cases,
      activeCaseId,
      lastPolicyId,
      lastCaseId,
      lastTxHash,
      pending,
      lastError,
      loading,
      publishPolicy,
      submitCase,
      fileAppeal,
      judgeCase,
      judgeAppeal,
      refresh,
      getCase,
    ],
  );

  return <CourtContext.Provider value={value}>{children}</CourtContext.Provider>;
}

export function useCourt() {
  const value = useContext(CourtContext);
  if (!value) {
    throw new Error("useCourt must be used inside CourtProvider");
  }
  return value;
}

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

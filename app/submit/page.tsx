"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCourt } from "@/components/providers/CourtProvider";
import { AppShell } from "@/components/shell/AppShell";
import { Countdown } from "@/components/ui/Countdown";
import { Icon } from "@/components/ui/Icon";
import { routes } from "@/lib/routes";

const steps = [
  { id: 1, name: "Select Policy", code: "PHASE_01_POL" },
  { id: 2, name: "Coordinates", code: "PHASE_02_LOC" },
  { id: 3, name: "Telemetry", code: "PHASE_03_TEL" },
  { id: 4, name: "Bond Lock", code: "PHASE_04_BND" },
  { id: 5, name: "Validation", code: "PHASE_05_VAL" },
];

export default function SubmitWalletPage() {
  const router = useRouter();
  const {
    policies,
    lastPolicyId,
    address,
    submitCase,
    pending,
    lastTxHash,
    lastError,
    loading,
  } = useCourt();
  const [current, setCurrent] = useState(1);
  const [policy, setPolicy] = useState(
    lastPolicyId ?? policies[0]?.id ?? "",
  );
  const [wallet, setWallet] = useState(address ?? "");
  const [evidence, setEvidence] = useState("");
  const [artifacts, setArtifacts] = useState<string[]>([]);
  const [stakeAmount, setStakeAmount] = useState("5.00");
  const [error, setError] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    if (address && !wallet) setWallet(address);
  }, [address, wallet]);

  useEffect(() => {
    if (!policy && (lastPolicyId || policies[0]?.id)) {
      setPolicy(lastPolicyId ?? policies[0].id);
    }
  }, [lastPolicyId, policies, policy]);

  const progress = (current / steps.length) * 100;
  const header = steps[current - 1].code;
  const selectedPolicy = policies.find((item) => item.id === policy);
  const visiblePolicies = useMemo(() => policies, [policies]);

  const nextLabel = current === 5 ? "Execute Contract" : "Next Phase";

  const addArtifact = (value: string) => {
    const next = value.trim();
    if (!next) return;
    setArtifacts((items) =>
      items.includes(next) ? items : [...items, next],
    );
    setEvidence("");
  };

  const goNext = () => {
    setError("");
    if (current === 1 && !policy) {
      setError("Select a policy before continuing.");
      return;
    }
    if (current === 2 && !wallet.trim()) {
      setError("A target wallet address is required.");
      return;
    }
    if (current === 4 && !stakeAmount.trim()) {
      setError("Enter the bond amount to lock.");
      return;
    }
    if (current < 5) {
      setCurrent((value) => value + 1);
      return;
    }
    void (async () => {
      try {
        const record = await submitCase({
          policyId: policy,
          wallet,
          evidence: artifacts,
          stakeAmount,
          stakeToken: "GEN",
        });
        setSubmittedId(record.id);
        router.push(routes.case(record.id));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : String(caught));
      }
    })();
  };

  return (
    <AppShell>
      <main className="pt-10 pb-section_gap px-margin_mobile md:px-margin_desktop max-w-7xl mx-auto flex gap-gutter">
        <aside className="w-64 shrink-0 hidden lg:block sticky top-[120px] h-fit">
          <div className="bg-surface-container-low tech-border p-6 flex flex-col gap-6 iso-shadow relative">
            <div className="absolute -top-3 -right-3 bg-surface-bright tech-border px-3 py-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-label-technical text-label-technical text-primary uppercase">
                Sys_Active
              </span>
            </div>
            <div className="border-b border-outline-variant pb-4">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-1">
                File Appeal
              </h2>
              <p className="font-label-technical text-label-technical text-on-surface-variant uppercase">
                ID: TX-8924-B
              </p>
            </div>
            <div className="bg-surface-container tech-border p-3">
              <div className="flex justify-between items-end mb-2">
                <span className="font-label-technical text-label-technical text-on-surface-variant">
                  Submission Window
                </span>
                <Icon name="timer" className="text-error text-[18px]" />
              </div>
              <Countdown
                initialSeconds={4 * 3600 + 12 * 60 + 59}
                className="font-stat-value text-stat-value text-on-surface tracking-tighter block"
              />
            </div>
            <ul className="flex flex-col gap-2 mt-4">
              {steps.map((step) => {
                const active = step.id === current;
                const past = step.id < current;
                return (
                  <li
                    key={step.id}
                    className={`flex items-center gap-3 font-label-technical text-label-technical ${
                      active
                        ? "text-primary"
                        : past
                          ? "text-on-surface"
                          : "text-on-surface-variant"
                    }`}
                  >
                    <Icon
                      name={
                        active
                          ? "radio_button_checked"
                          : past
                            ? "check_circle"
                            : "radio_button_unchecked"
                      }
                      className="text-[18px]"
                    />
                    <span className="uppercase">{step.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
        <section className="flex-grow max-w-3xl w-full">
          <div className="bg-surface-container-lowest tech-border min-h-[600px] flex flex-col relative iso-shadow">
            <header className="h-12 border-b border-outline-variant flex items-center justify-between px-4 bg-surface-container">
              <div className="flex gap-2 items-center">
                <Icon name="terminal" className="text-primary text-[18px]" />
                <span className="font-label-technical text-label-technical text-primary uppercase">
                  {header}
                </span>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-outline-variant" />
                <div className="w-2 h-2 bg-outline-variant" />
                <div className="w-2 h-2 bg-outline-variant" />
              </div>
            </header>
            <div className="p-6 md:p-8 flex-grow step-enter" key={current}>
              {current === 1 ? (
                <>
                  <h3 className="font-headline-lg text-headline-lg mb-2">
                    Select Target Policy
                  </h3>
                  <p className="text-on-surface-variant mb-8">
                    Identify the governing rule set under which you are filing
                    this appeal.
                  </p>
                  <div className="flex flex-col gap-3">
                    {loading ? (
                      <p className="font-label-technical text-label-technical text-on-surface-variant">
                        Loading on-chain policies…
                      </p>
                    ) : visiblePolicies.length === 0 ? (
                      <p className="font-label-technical text-label-technical text-on-surface-variant">
                        No on-chain policies yet. Publish a policy first, then
                        return here.
                      </p>
                    ) : null}
                    {visiblePolicies.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start gap-4 p-4 border border-outline-variant bg-surface hover:bg-surface-container-high cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-container/10"
                      >
                        <input
                          className="mt-1 bg-surface border-outline text-primary focus:ring-primary"
                          name="policy"
                          type="radio"
                          checked={policy === item.id}
                          onChange={() => setPolicy(item.id)}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-label-technical text-label-technical text-primary">
                              {item.id}
                            </span>
                            <span className="bg-surface-bright px-2 py-0.5 font-label-technical text-[10px] uppercase">
                              {item.project}
                            </span>
                          </div>
                          <h4 className="font-body-md text-on-surface font-semibold">
                            {item.title}
                          </h4>
                          <p className="text-on-surface-variant text-sm mt-1 whitespace-pre-wrap">
                            {item.seed ? item.body : item.body}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              ) : null}
              {current === 2 ? (
                <>
                  <h3 className="font-headline-lg text-headline-lg mb-2">
                    Subject Coordinates
                  </h3>
                  <p className="text-on-surface-variant mb-8">
                    Input the primary wallet address and link verifiable on-chain
                    evidence.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label className="block font-label-technical text-label-technical text-on-surface mb-2">
                        Target Wallet Address
                      </label>
                      <input
                        className="w-full bg-surface-container-high border border-outline-variant text-on-surface font-label-technical text-label-technical py-3 px-4 focus:border-primary outline-none"
                        placeholder="0x..."
                        value={wallet}
                        onChange={(event) => setWallet(event.target.value)}
                      />
                      {address && wallet !== address ? (
                        <button
                          type="button"
                          onClick={() => setWallet(address)}
                          className="mt-2 font-label-technical text-label-technical text-primary uppercase"
                        >
                          Use connected passport
                        </button>
                      ) : null}
                    </div>
                    <div>
                      <label className="block font-label-technical text-label-technical text-on-surface mb-2">
                        Evidence Artifacts (URL / TX Hash)
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          className="flex-grow bg-surface-container-high border border-outline-variant text-on-surface font-label-technical text-label-technical py-3 px-4 focus:border-primary outline-none"
                          placeholder="HTTPS:// OR 0X..."
                          value={evidence}
                          onChange={(event) => setEvidence(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addArtifact(evidence);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addArtifact(evidence)}
                          className="bg-surface-variant border border-outline-variant px-4 hover:bg-surface-bright"
                        >
                          <Icon name="add" className="text-on-surface" />
                        </button>
                      </div>
                      {artifacts.map((item, index) => (
                        <p
                          key={`${item}-${index}`}
                          className="font-label-technical text-label-technical text-primary mb-2 break-all"
                        >
                          {item}
                        </p>
                      ))}
                      <label className="bg-surface border border-outline-variant border-dashed p-4 text-center block cursor-pointer hover:bg-surface-container">
                        <Icon
                          name="upload_file"
                          className="text-on-surface-variant mb-2 text-[32px]"
                        />
                        <p className="font-label-technical text-label-technical text-on-surface-variant">
                          Or upload raw logs (.json, .csv)
                        </p>
                        <input
                          type="file"
                          accept=".json,.csv,.txt"
                          className="sr-only"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) addArtifact(file.name);
                            event.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </>
              ) : null}
              {current === 3 ? (
                <>
                  <div className="flex justify-between items-end mb-6 gap-4 flex-wrap">
                    <div>
                      <h3 className="font-headline-lg text-headline-lg mb-2">
                        Evidence Telemetry
                      </h3>
                      <p className="text-on-surface-variant">
                        Live preview of the artifacts attached to this filing.
                      </p>
                    </div>
                    <div className="bg-error-container/20 border border-error px-3 py-1 flex items-center gap-2">
                      <span className="w-2 h-2 bg-error animate-pulse" />
                      <span className="font-label-technical text-label-technical text-error uppercase">
                        Live Public Data
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface border border-outline-variant p-1">
                    <div className="h-64 bg-surface-container-high relative overflow-hidden flex items-center justify-center border border-outline-variant">
                      <div className="relative z-10 flex flex-col items-center px-6 text-center">
                        <Icon
                          name="radar"
                          className="text-primary text-[48px] mb-2 animate-bounce"
                        />
                        <span className="font-label-technical text-label-technical bg-background/80 px-2 py-1">
                          Scanning {wallet || "unassigned wallet"}
                        </span>
                        <div className="mt-4 max-h-28 overflow-y-auto w-full space-y-1">
                          {artifacts.length === 0 ? (
                            <p className="font-label-technical text-label-technical text-on-surface-variant">
                              No artifacts attached. Preview is empty.
                            </p>
                          ) : (
                            artifacts.map((item, index) => (
                              <p
                                key={`${item}-${index}`}
                                className="font-label-technical text-[11px] text-primary break-all"
                              >
                                {item}
                              </p>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <div className="bg-surface-container p-4">
                        <p className="font-label-technical text-label-technical text-on-surface-variant mb-1">
                          Attached Artifacts
                        </p>
                        <p className="font-stat-value text-stat-value text-on-surface">
                          {artifacts.length}
                        </p>
                      </div>
                      <div className="bg-surface-container p-4">
                        <p className="font-label-technical text-label-technical text-on-surface-variant mb-1">
                          Target Set
                        </p>
                        <p className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface break-all">
                          {wallet || "None"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              {current === 4 ? (
                <>
                  <h3 className="font-headline-lg text-headline-lg mb-2">
                    Bond Requirement
                  </h3>
                  <p className="text-on-surface-variant mb-8">
                    Secure your appeal by locking the required operational bond.
                    This prevents network spam.
                  </p>
                  <div className="bg-surface-container-high border border-outline-variant p-6 mb-8 relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage:
                          "linear-gradient(#cfbcff 1px, transparent 1px), linear-gradient(90deg, #cfbcff 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                      }}
                    />
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <Icon name="lock" className="text-tertiary text-[48px] mb-4" />
                      <p className="font-label-technical text-label-technical text-on-surface-variant mb-2 uppercase">
                        Required Stake
                      </p>
                      <div className="flex flex-wrap items-end justify-center gap-3 mb-2 w-full px-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={stakeAmount}
                          onChange={(event) => setStakeAmount(event.target.value)}
                          className="min-w-[10rem] w-56 max-w-full bg-transparent border-b border-outline-variant text-center font-display-lg text-[40px] md:text-[56px] leading-none text-on-surface focus:border-primary outline-none"
                        />
                        <span className="text-tertiary text-[28px] md:text-[40px] pb-1 shrink-0">
                          GEN
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant max-w-md">
                        Bond will be slashed if appeal is deemed malicious or
                        entirely unfounded by the operator consensus.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={goNext}
                      className="bg-primary text-on-primary-fixed font-label-technical text-label-technical uppercase px-8 py-4 flex items-center gap-2 glow-primary hover:bg-primary-fixed-dim transition-colors"
                    >
                      Lock Bond & Proceed
                      <Icon name="arrow_forward" className="text-[18px]" />
                    </button>
                  </div>
                </>
              ) : null}
              {current === 5 ? (
                <>
                  <h3 className="font-headline-lg text-headline-lg mb-2">
                    Final Validation
                  </h3>
                  <p className="text-on-surface-variant mb-8">
                    Review the payload before committing to the immutable ledger.
                  </p>
                  <div className="space-y-4 font-label-technical text-label-technical text-sm">
                    <div className="flex justify-between border-b border-outline-variant py-2 gap-4">
                      <span className="text-on-surface-variant">Policy ID:</span>
                      <span className="text-primary text-right">{policy}</span>
                    </div>
                    <div className="flex justify-between border-b border-outline-variant py-2 gap-4">
                      <span className="text-on-surface-variant">Target:</span>
                      <span className="text-on-surface text-right break-all">
                        {wallet}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-outline-variant py-2 gap-4">
                      <span className="text-on-surface-variant">
                        Evidence artifacts:
                      </span>
                      <span className="text-on-surface text-right">
                        {artifacts.length === 0
                          ? "None attached"
                          : `${artifacts.length} attached`}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-outline-variant py-2 gap-4">
                      <span className="text-on-surface-variant">Locked Bond:</span>
                      <span className="text-tertiary">
                        {stakeAmount} GEN
                      </span>
                    </div>
                  </div>
                  {selectedPolicy ? (
                    <div className="mt-8">
                      <p className="font-label-technical text-label-technical text-on-surface-variant mb-2 uppercase">
                        Full policy text
                      </p>
                      <div className="bg-surface-container p-4 border border-outline-variant font-body-md text-on-surface whitespace-pre-wrap">
                        {selectedPolicy.body}
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-12 bg-surface-container-high border-l-4 border-error p-4">
                    <div className="flex items-start gap-3">
                      <Icon name="warning" className="text-error mt-0.5" />
                      <div>
                        <p className="font-body-md text-on-surface font-semibold mb-1">
                          Irreversible Action
                        </p>
                        <p className="text-sm text-on-surface-variant">
                          This commits the filing to the Sybil Court contract on
                          studionet.
                        </p>
                      </div>
                    </div>
                  </div>
                  {submittedId ? (
                    <p className="mt-6 font-label-technical text-label-technical text-primary">
                      Filing stored as {submittedId}.
                    </p>
                  ) : null}
                  {lastTxHash ? (
                    <p className="mt-2 font-label-technical text-label-technical text-on-surface-variant break-all">
                      Tx {lastTxHash}
                    </p>
                  ) : null}
                  {pending ? (
                    <p className="mt-4 font-label-technical text-label-technical text-primary">
                      {pending}
                    </p>
                  ) : null}
                </>
              ) : null}
              {error || lastError ? (
                <p className="mt-6 font-label-technical text-label-technical text-error whitespace-pre-wrap break-all">
                  {error || lastError}
                </p>
              ) : null}
            </div>
            <footer className="border-t border-outline-variant bg-surface-container p-4 flex justify-between items-center gap-3">
              <button
                type="button"
                disabled={current === 1}
                onClick={() => {
                  setError("");
                  setCurrent((value) => Math.max(1, value - 1));
                }}
                className="font-label-technical text-label-technical uppercase text-on-surface-variant hover:text-on-surface px-4 py-2 border border-transparent hover:border-outline-variant disabled:opacity-30"
              >
                <Icon name="chevron_left" className="align-middle mr-1 text-[16px]" />
                Abort / Back
              </button>
              <div className="w-1/3 h-2 bg-surface border border-outline-variant overflow-hidden hidden sm:block">
                <div
                  className="h-full barcode-progress transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <button
                type="button"
                disabled={Boolean(pending)}
                onClick={goNext}
                className={`font-label-technical text-label-technical uppercase px-6 py-2 tech-border flex items-center gap-2 disabled:opacity-60 ${
                  current === 5
                    ? "bg-primary text-on-primary-fixed glow-primary"
                    : "bg-surface-variant text-on-surface hover:bg-surface-bright"
                }`}
              >
                {pending && current === 5 ? pending : nextLabel}
                <Icon
                  name={current === 5 ? "gavel" : "chevron_right"}
                  className="text-[16px]"
                />
              </button>
            </footer>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

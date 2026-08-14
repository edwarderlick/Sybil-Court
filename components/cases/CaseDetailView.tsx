"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCourt } from "@/components/providers/CourtProvider";
import { AppShell } from "@/components/shell/AppShell";
import { Icon } from "@/components/ui/Icon";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { routes } from "@/lib/routes";
import { buildVerdictView } from "@/lib/verdictView";

export function CaseDetailView({ caseId }: { caseId: string }) {
  const {
    getCase,
    setActiveCase,
    judgeCase,
    judgeAppeal,
    pending,
    lastTxHash,
    lastError,
    loading,
  } = useCourt();
  const record = getCase(caseId);
  const [actionError, setActionError] = useState("");
  const [showFullVerdict, setShowFullVerdict] = useState(false);

  useEffect(() => {
    if (record) setActiveCase(record.id);
  }, [record, setActiveCase]);

  if (!record) {
    return (
      <AppShell sidebar sidebarActive="disputes" dock>
        <main className="min-h-[calc(100dvh-80px)] grid-bg flex items-center justify-center p-margin_mobile">
          <div className="max-w-xl border border-outline-variant bg-surface-container-low p-10 text-center">
            <p className="font-label-technical text-label-technical text-primary uppercase mb-4">
              Docket Missing
            </p>
            <h1 className="font-headline-xl text-headline-lg md:text-headline-xl uppercase mb-4">
              {loading ? "Loading Docket" : "Record Not Found"}
            </h1>
            <p className="text-on-surface-variant mb-8">
              {loading
                ? "Reading the on-chain docket."
                : "This case is not in the current public docket."}
            </p>
            <Link
              href={routes.cases}
              className="inline-flex bg-primary text-on-primary font-label-technical text-label-technical uppercase px-6 py-3"
            >
              Return to Case Log
            </Link>
          </div>
        </main>
      </AppShell>
    );
  }

  const verdict = record.verdict ?? [];
  const view = buildVerdictView(record);
  const statusTone =
    view?.outcome === "Eligible" || record.outcome === "Eligible"
      ? "bg-tertiary/20 border-tertiary text-tertiary"
      : view?.outcome === "Ineligible" || record.outcome === "Ineligible"
        ? "bg-error-container/20 border-error text-error"
        : record.statusTone === "pending"
          ? "bg-surface-container-high border-outline-variant text-on-surface"
          : "bg-error-container/20 border-error text-error";
  const outcomeTone = statusTone;

  return (
    <AppShell sidebar sidebarActive="disputes" dock>
      <main className="p-margin_mobile md:p-gutter min-h-[calc(100dvh-80px)]">
        <div className="max-w-6xl mx-auto space-y-gutter pb-24">
          <div className="flex flex-wrap justify-between items-end gap-4 border-b border-outline-variant pb-4">
            <div>
              <div className="font-label-technical text-label-technical text-on-surface-variant uppercase tracking-widest flex items-center gap-2 mb-2">
                <Link href={routes.cases} className="hover:text-primary">
                  Active Disputes
                </Link>
                <Icon name="chevron_right" className="text-[14px]" />
                <span className="text-primary">DOCKET #{record.docket}</span>
              </div>
              <h1 className="font-headline-xl text-[36px] md:text-headline-xl text-on-surface break-all">
                {record.title}
              </h1>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 border ${statusTone}`}>
              <Icon name="radio_button_checked" className="animate-pulse text-[18px]" />
              <span className="font-label-technical text-label-technical uppercase">
                {record.status}
              </span>
            </div>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <div className="col-span-1 lg:col-span-2 bg-surface-container border border-outline-variant p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Icon name="fingerprint" className="text-[120px]" />
              </div>
              <h2 className="font-label-technical text-label-technical text-on-surface-variant uppercase mb-4 border-b border-outline-variant/50 pb-2">
                Claim Parameters
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="font-label-technical text-label-technical text-outline uppercase mb-1">
                    Target Policy
                  </div>
                  <div className="font-headline-lg text-headline-lg text-primary">
                    {record.policyTitle}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-high border border-outline-variant/30 p-3">
                    <div className="font-label-technical text-label-technical text-outline uppercase mb-2">
                      Flagged Entity
                    </div>
                    <div className="font-label-technical text-label-technical text-on-surface break-all">
                      {record.flagged ?? record.wallet}
                    </div>
                  </div>
                  <div className="bg-surface-container-high border border-outline-variant/30 p-3">
                    <div className="font-label-technical text-label-technical text-outline uppercase mb-2">
                      Submitter
                    </div>
                    <div className="font-label-technical text-label-technical text-tertiary break-all">
                      {record.submitter ?? "On-chain filing"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-1 bg-surface-container border border-outline-variant p-6 flex flex-col justify-between">
              <div>
                <h2 className="font-label-technical text-label-technical text-on-surface-variant uppercase mb-4 border-b border-outline-variant/50 pb-2">
                  Value at Risk
                </h2>
                <div className="font-stat-value text-stat-value text-error break-all">
                  {record.stake}
                </div>
                <div className="font-label-technical text-label-technical text-outline mt-1 uppercase">
                  {record.stakeLabel}
                </div>
              </div>
              <div className="mt-8">
                <div className="font-label-technical text-label-technical text-primary uppercase mb-2">
                  Docket status
                </div>
                <p className="font-label-technical text-label-technical text-on-surface">
                  {record.meterLabel ?? record.status}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6 flex items-center gap-3">
              <Icon name="hub" className="text-primary" /> Evidence Board
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div className="col-span-1 md:col-span-2 bg-surface-container-low border border-outline-variant p-5 min-h-[200px] flex flex-col">
                <div className="flex justify-between items-start gap-3">
                  <div className="font-label-technical text-label-technical text-on-surface-variant uppercase">
                    Submitted Evidence
                  </div>
                  <LiveBadge />
                </div>
                {record.evidence.length > 0 ? (
                  <div className="mt-4 space-y-2 overflow-y-auto">
                    {record.evidence.map((item, index) => (
                      <p
                        key={`${item}-${index}`}
                        className="font-label-technical text-label-technical text-on-surface break-all"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 font-body-md text-on-surface-variant">
                    No user-supplied evidence links were stored on this docket.
                    Judgment may still try chain explorers if the wallet matches
                    a supported address format.
                  </p>
                )}
              </div>
              <div className="col-span-1 bg-surface-container-low border border-outline-variant p-5 min-h-[200px] flex flex-col justify-between">
                <div className="font-label-technical text-label-technical text-on-surface-variant uppercase">
                  Stored links
                </div>
                <div className="font-stat-value text-stat-value text-on-surface">
                  {record.evidence.length}
                </div>
                <a
                  className="font-label-technical text-label-technical text-primary hover:underline flex items-center gap-1"
                  href="#verdict"
                >
                  Jump to verdict <Icon name="open_in_new" className="text-[14px]" />
                </a>
              </div>
            </div>
          </section>

          <section className="mt-section_gap">
            <div className="bg-surface-container border border-outline-variant p-8 mb-gutter">
              <h2 className="font-label-technical text-label-technical text-on-surface-variant uppercase mb-4">
                Governing Policy
              </h2>
              <div className="font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                {record.policyText}
              </div>
            </div>
          </section>

          <section id="verdict" className="space-y-gutter">
            {view ? (
              <>
                <div className="bg-surface-container border border-outline-variant p-6 md:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 className="font-label-technical text-label-technical text-on-surface-variant uppercase">
                      Court Outcome
                    </h2>
                    <span
                      className={`font-label-technical text-label-technical uppercase px-3 py-1 border ${outcomeTone}`}
                    >
                      {view.outcome}
                    </span>
                  </div>
                  <p className="font-body-md text-on-surface leading-relaxed">
                    {view.summary}
                  </p>
                </div>

                <div className="bg-surface-container-low border border-outline-variant p-6">
                  <h3 className="font-label-technical text-label-technical text-on-surface-variant uppercase mb-4">
                    Evidence found
                  </h3>
                  {view.evidence.length === 0 ? (
                    <p className="font-body-md text-on-surface-variant">
                      No public evidence links were stored on this docket.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {view.evidence.map((item) => (
                        <li
                          key={item.url}
                          className="border border-outline-variant/50 bg-surface-container p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className="font-label-technical text-[11px] uppercase text-primary">
                              {item.status}
                            </span>
                          </div>
                          <p className="font-label-technical text-label-technical text-on-surface break-all">
                            {item.url}
                          </p>
                          <p className="font-body-md text-sm text-on-surface-variant mt-2">
                            {item.note}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-surface-container border-l-4 border-error p-6 md:p-8">
                  <h3 className="font-label-technical text-label-technical text-error uppercase mb-3">
                    Why this outcome
                  </h3>
                  <div className="font-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                    {view.why}
                  </div>
                </div>

                {view.strengthen.length > 0 ? (
                  <div className="bg-surface-container-high border border-outline-variant p-6 md:p-8">
                    <h3 className="font-label-technical text-label-technical text-primary uppercase mb-3">
                      What would strengthen this case
                    </h3>
                    <p className="font-body-md text-sm text-on-surface-variant mb-4">
                      Based only on the stored policy. The court does not invent
                      missing pages or on-chain activity.
                    </p>
                    <ul className="space-y-3 list-disc pl-5">
                      {view.strengthen.map((hint) => (
                        <li key={hint} className="font-body-md text-on-surface">
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="bg-surface-container-high border-l-4 border-error p-8">
                <p className="font-body-md text-on-surface-variant">
                  Written verdict has not been issued on this docket. The
                  governing policy above is stored in full and is not truncated.
                </p>
              </div>
            )}

            {record.verdictText || verdict.length > 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant p-6">
                <button
                  type="button"
                  onClick={() => setShowFullVerdict((open) => !open)}
                  className="w-full flex items-center justify-between gap-3 font-label-technical text-label-technical uppercase text-on-surface hover:text-primary"
                >
                  <span>Full written verdict</span>
                  <Icon
                    name={showFullVerdict ? "expand_less" : "expand_more"}
                    className="text-[20px]"
                  />
                </button>
                {showFullVerdict ? (
                  <div className="mt-4 font-body-md text-on-surface leading-relaxed whitespace-pre-wrap break-words border-t border-outline-variant/40 pt-4">
                    {record.verdictText || verdict.join("\n\n")}
                  </div>
                ) : (
                  <p className="mt-3 font-label-technical text-[11px] text-on-surface-variant">
                    Stored on-chain without truncation. Expand to read every word.
                  </p>
                )}
              </div>
            ) : null}

            {record.appeal ? (
              <div className="border border-outline-variant p-6">
                <p className="font-label-technical text-label-technical text-primary uppercase mb-2">
                  Filed Appeal
                </p>
                <p className="whitespace-pre-wrap">{record.appeal.reason}</p>
              </div>
            ) : null}
          </section>

          <section className="py-gutter border-t border-outline-variant mt-gutter flex flex-col md:flex-row items-center justify-between gap-6 bg-surface-container-lowest p-6 border">
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">
                {record.statusTone === "pending"
                  ? "Run Judgment"
                  : record.status === "Active Appeal"
                    ? "Judge Appeal"
                    : "Initiate Appeal"}
              </h3>
              <p className="text-on-surface-variant font-label-technical text-label-technical uppercase mt-1">
                {record.statusTone === "pending"
                  ? "Fetch public evidence and write the full verdict on-chain."
                  : record.status === "Active Appeal"
                    ? "Re-evaluate the appealed docket with the same live helpers."
                    : `Appeal bond on this docket: ${record.appealStake ?? record.stake}.`}
              </p>
              {lastTxHash ? (
                <p className="font-label-technical text-label-technical text-on-surface-variant break-all mt-2">
                  Tx {lastTxHash}
                </p>
              ) : null}
              {pending ? (
                <p className="font-label-technical text-label-technical text-primary mt-2">
                  {pending} Public fetches plus two consensus rounds. Keep this
                  tab open; several minutes is normal.
                </p>
              ) : null}
              {actionError || lastError ? (
                <p className="font-label-technical text-label-technical text-error whitespace-pre-wrap break-all mt-2">
                  {actionError || lastError}
                </p>
              ) : null}
            </div>
            {record.statusTone === "pending" ? (
              <button
                type="button"
                disabled={Boolean(pending)}
                onClick={() => {
                  setActionError("");
                  void judgeCase(record.id).catch((caught) => {
                    setActionError(
                      caught instanceof Error ? caught.message : String(caught),
                    );
                  });
                }}
                className="bg-primary text-on-primary font-label-technical text-label-technical px-8 py-4 uppercase hover:scale-95 duration-100 transition-all flex items-center gap-3 disabled:opacity-60"
              >
                <Icon name="gavel" /> {pending ? pending : "Run Judgment"}
              </button>
            ) : record.status === "Active Appeal" ? (
              <button
                type="button"
                disabled={Boolean(pending)}
                onClick={() => {
                  setActionError("");
                  void judgeAppeal(record.id).catch((caught) => {
                    setActionError(
                      caught instanceof Error ? caught.message : String(caught),
                    );
                  });
                }}
                className="bg-primary text-on-primary font-label-technical text-label-technical px-8 py-4 uppercase hover:scale-95 duration-100 transition-all flex items-center gap-3 disabled:opacity-60"
              >
                <Icon name="gavel" /> {pending ? pending : "Judge Appeal"}
              </button>
            ) : (
              <Link
                href={routes.appeal(record.id)}
                className="bg-error text-on-error font-label-technical text-label-technical px-8 py-4 uppercase hover:scale-95 duration-100 transition-all shadow-[0_0_20px_rgba(255,180,171,0.2)] flex items-center gap-3"
              >
                <Icon name="gavel" /> Challenge Verdict
              </Link>
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );
}

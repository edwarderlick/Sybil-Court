"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCourt } from "@/components/providers/CourtProvider";
import { AppShell } from "@/components/shell/AppShell";
import { Countdown } from "@/components/ui/Countdown";
import { Icon } from "@/components/ui/Icon";
import { appealContext } from "@/lib/content";
import { routes } from "@/lib/routes";

export default function AppealPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getCase, setActiveCase, fileAppeal, pending, lastTxHash, lastError } =
    useCourt();
  const record = getCase(params.id);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (record) setActiveCase(record.id);
  }, [record, setActiveCase]);

  const caseId = record?.id ?? params.id;

  return (
    <AppShell footer={false}>
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100dvh-80px)] p-margin_mobile md:p-margin_desktop">
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-40" />
        <div className="w-full max-w-[800px] flex flex-col gap-gutter relative">
          <header className="flex justify-between items-end border-b border-outline-variant pb-grid_unit mb-grid_unit">
            <div>
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">
                Initiate Appeal
              </h1>
              <p className="font-label-technical text-label-technical text-on-surface-variant uppercase mt-2">
                Protocol Action: Challenge Verdict
              </p>
            </div>
            <Link
              href={routes.case(caseId)}
              className="font-label-technical text-label-technical text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1 border border-outline-variant px-3 py-1 bg-surface-container-low"
            >
              <Icon name="close" className="text-[16px]" />
              Cancel
            </Link>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-5 flex flex-col gap-gutter">
              <div className="bg-surface-container-low border border-outline-variant p-4 isometric-card">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-label-technical text-label-technical text-on-surface-variant uppercase">
                    Target Case
                  </span>
                  <span className="bg-error-container text-on-error-container px-2 py-0.5 font-label-technical text-label-technical flex items-center gap-1">
                    <Icon name="warning" className="text-[14px]" />
                    Disputed
                  </span>
                </div>
                <h2 className="font-stat-value text-[24px] font-bold text-on-surface mb-1">
                  {record ? `CASE-${record.docket}` : appealContext.caseId}
                </h2>
                <p className="font-body-md text-on-surface-variant text-sm mb-4">
                  {record?.title ?? appealContext.summary}
                </p>
                <div className="border-t border-outline-variant pt-3 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="font-label-technical text-label-technical text-on-surface-variant">
                      Prior Resolution:
                    </span>
                    <span className="font-label-technical text-label-technical text-error">
                      {record?.status ?? appealContext.prior}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-label-technical text-label-technical text-on-surface-variant">
                      Time Remaining:
                    </span>
                    {record?.windowSeconds ? (
                      <Countdown
                        initialSeconds={record.windowSeconds}
                        className="font-label-technical text-label-technical text-on-surface"
                      />
                    ) : (
                      <span className="font-label-technical text-label-technical text-on-surface">
                        {appealContext.remaining}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-surface-container border border-outline-variant p-4 isometric-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-tertiary-container/20 flex items-center justify-center translate-x-2 -translate-y-2">
                  <Icon name="lock" className="text-tertiary text-[20px] mb-2 mr-2" />
                </div>
                <span className="font-label-technical text-label-technical text-on-surface-variant uppercase mb-2 block">
                  Required Stake
                </span>
                <div className="font-stat-value text-stat-value text-tertiary mb-1">
                  {record?.appealStake?.split(" ")[0] ?? appealContext.stake}{" "}
                  <span className="text-[20px] text-tertiary/70">
                    {record?.appealStake?.split(" ")[1] ?? appealContext.stakeToken}
                  </span>
                </div>
                <p className="font-label-technical text-label-technical text-on-surface-variant leading-relaxed">
                  This bond will be locked during the appeal process. It is forfeit
                  if the appeal is rejected by the higher court.
                </p>
              </div>
            </div>
            <div className="md:col-span-7 flex flex-col gap-gutter">
              <div className="bg-surface border border-outline-variant p-4 isometric-card flex flex-col h-full">
                <label
                  className="font-label-technical text-label-technical text-on-surface uppercase mb-3 flex items-center gap-2"
                  htmlFor="appeal-reason"
                >
                  <Icon name="subject" className="text-[16px]" />
                  Reasoning for Appeal
                </label>
                <textarea
                  id="appeal-reason"
                  className="flex-grow w-full bg-surface-container-low border border-outline-variant p-3 font-body-md text-on-surface focus:outline-none focus:border-primary min-h-[200px]"
                  placeholder="Provide cryptographic proof or logical reasoning challenging the initial verdict..."
                  maxLength={2048}
                  value={reason}
                  onChange={(event) => {
                    setReason(event.target.value);
                    setError("");
                  }}
                />
                <div className="mt-3 flex justify-end">
                  <span className="font-label-technical text-label-technical text-on-surface-variant">
                    {reason.length} / 2048 Bytes
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-outline-variant pt-gutter mt-grid_unit flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-label-technical text-label-technical text-on-surface-variant max-w-md">
              By submitting, you agree to lock the required bond. The process is
              irreversible once initiated on-chain.
            </div>
            <button
              type="button"
              disabled={Boolean(pending)}
              onClick={() => {
                if (!record) {
                  setError("This docket is not in the current session.");
                  return;
                }
                if (!reason.trim()) {
                  setError("Appeal reasoning is required.");
                  return;
                }
                void (async () => {
                  try {
                    await fileAppeal(record.id, {
                      reason: reason.trim(),
                      stake: record.appealStake ?? record.stake,
                    });
                    router.push(routes.case(record.id));
                  } catch (caught) {
                    setError(
                      caught instanceof Error ? caught.message : String(caught),
                    );
                  }
                })();
              }}
              className="bg-primary text-on-primary font-label-technical text-label-technical uppercase px-8 py-4 flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(207,188,255,0.3)] w-full md:w-auto justify-center disabled:opacity-60"
            >
              <Icon name="gavel" className="text-[18px]" />
              {pending ? pending : "Stake & File Appeal"}
            </button>
          </div>
          {lastTxHash ? (
            <p className="font-label-technical text-label-technical text-on-surface-variant break-all">
              Tx {lastTxHash}
            </p>
          ) : null}
          {error || lastError ? (
            <p className="font-label-technical text-label-technical text-error whitespace-pre-wrap break-all">
              {error || lastError}
            </p>
          ) : null}
        </div>
      </main>
    </AppShell>
  );
}

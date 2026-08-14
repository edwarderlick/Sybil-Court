"use client";

import Link from "next/link";
import { useCourt } from "@/components/providers/CourtProvider";
import { AppShell } from "@/components/shell/AppShell";
import { Icon } from "@/components/ui/Icon";
import { routes } from "@/lib/routes";

export default function ActivityPage() {
  const { cases, loading, lastError } = useCourt();
  const live = [...cases].reverse();

  return (
    <AppShell sidebar sidebarActive="state" dock>
      <div className="tech-grid min-h-[calc(100dvh-80px)]">
        <div className="p-margin_mobile md:p-margin_desktop max-w-5xl mx-auto w-full pb-24">
          <header className="mb-12 flex justify-between items-end border-b border-outline-variant/50 pb-6">
            <div>
              <h1 className="font-headline-xl text-[40px] md:text-headline-xl text-on-surface mb-2 uppercase">
                Protocol Feed
              </h1>
              <p className="font-label-technical text-label-technical text-on-surface-variant">
                On-chain cases from the live Sybil Court contract
              </p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/30 px-3 py-1.5">
              <div className="relative w-2 h-2 flex items-center justify-center">
                <div className="absolute w-2 h-2 bg-primary rounded-full pulse-dot" />
                <div className="relative w-1.5 h-1.5 bg-primary rounded-full" />
              </div>
              <span className="font-label-technical text-label-technical text-primary uppercase tracking-widest">
                {loading ? "Syncing" : `${live.length} cases`}
              </span>
            </div>
          </header>
          {lastError ? (
            <p className="mb-6 font-label-technical text-label-technical text-error whitespace-pre-wrap break-all">
              {lastError}
            </p>
          ) : null}
          <div className="space-y-grid_unit">
            {live.map((item) => {
              const tone =
                item.outcome === "Eligible"
                  ? "bg-tertiary text-tertiary"
                  : item.outcome === "Ineligible"
                    ? "bg-error text-error"
                    : item.statusTone === "pending"
                      ? "bg-primary text-primary"
                      : "bg-outline text-on-surface-variant";
              const [bar, label] = tone.split(" ");
              return (
                <article
                  key={item.id}
                  className="bg-surface-container border border-outline-variant/30 p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:bg-surface-container-high transition-colors"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${bar}`} />
                  <div className="flex-shrink-0 md:w-32 flex flex-col gap-1">
                    <span className="font-label-technical text-label-technical text-on-surface-variant">
                      {item.status}
                    </span>
                    <span className="font-label-technical text-label-technical text-on-surface opacity-50">
                      {item.id}
                    </span>
                  </div>
                  <div className="flex-grow flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="gavel" className={`${label} text-[18px]`} />
                      <span
                        className={`font-label-technical text-label-technical uppercase ${label}`}
                      >
                        {item.outcome ?? item.meterLabel ?? item.status}
                      </span>
                    </div>
                    <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface break-all">
                      {item.wallet}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                      {item.policyTitle} · {item.stake}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-start">
                    <Link
                      href={routes.case(item.id)}
                      className="border border-outline-variant text-on-surface hover:border-primary transition-colors p-2 flex items-center justify-center"
                    >
                      <Icon name="arrow_outward" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          {loading ? (
            <p className="mt-8 font-label-technical text-label-technical text-on-surface-variant">
              Reading the on-chain docket…
            </p>
          ) : live.length === 0 ? (
            <p className="mt-8 font-label-technical text-label-technical text-on-surface-variant">
              No on-chain cases yet.
            </p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}

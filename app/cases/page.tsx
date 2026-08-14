"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCourt } from "@/components/providers/CourtProvider";
import { AppShell } from "@/components/shell/AppShell";
import { Countdown, CountdownBar } from "@/components/ui/Countdown";
import { Icon } from "@/components/ui/Icon";
import { type CaseRecord, type CaseStatusTone } from "@/lib/court";
import { routes } from "@/lib/routes";

type Filter = "all" | "open" | "resolved" | "appeal";

function matchesFilter(tone: CaseStatusTone, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "appeal") return tone === "appeal";
  if (filter === "resolved") return tone === "resolved";
  return tone === "open" || tone === "pending";
}

function CaseCard({ item }: { item: CaseRecord }) {
  const href = routes.case(item.id);
  if (item.statusTone === "resolved") {
    return (
      <article className="bg-surface-container-lowest border border-outline-variant/30 flex flex-col opacity-80 hover:opacity-100 transition-opacity">
        <div className="p-5 border-b border-outline-variant/20 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-surface-container text-outline px-2 py-1 font-label-technical text-[10px] uppercase border border-outline-variant">
                {item.status}
              </span>
              <span className="font-label-technical text-[10px] text-on-surface-variant">
                Case #{item.docket}
              </span>
            </div>
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile font-semibold line-through text-on-surface-variant">
              {item.wallet}
            </h3>
          </div>
          <div className="text-right">
            <div className="font-label-technical text-[10px] text-on-surface-variant mb-1">
              {item.stakeLabel}
            </div>
            <div className="font-stat-value text-[24px] text-outline font-semibold">
              {item.stake}
            </div>
          </div>
        </div>
        <div className="p-4 bg-background border-t border-outline-variant/20 flex justify-between items-center">
          <span className="font-label-technical text-[10px] text-on-surface-variant uppercase">
            Resolution Hash: {item.resolutionHash ?? "Pending"}
          </span>
          <Link
            href={href}
            className="font-label-technical text-[10px] text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
          >
            View Log <Icon name="receipt_long" className="text-[12px]" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-surface border border-outline-variant/50 flex flex-col relative overflow-hidden group">
      <div className="p-5 border-b border-outline-variant/30 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-2 py-1 font-label-technical text-[10px] uppercase border flex items-center gap-1 ${
                item.statusTone === "appeal"
                  ? "bg-error-container text-on-error border-error/20"
                  : "bg-surface-container-high text-tertiary border-tertiary/30"
              }`}
            >
              {item.statusTone === "appeal" ? (
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
              ) : null}
              {item.status}
            </span>
            <span className="font-label-technical text-[10px] text-on-surface-variant">
              Case #{item.docket}
            </span>
          </div>
          <h3 className="font-headline-lg-mobile text-headline-lg-mobile font-semibold break-all">
            {item.wallet}
          </h3>
        </div>
        <div className="text-right">
          <div className="font-label-technical text-[10px] text-on-surface-variant mb-1">
            {item.stakeLabel}
          </div>
          <div
            className={`font-stat-value text-[24px] font-semibold ${
              item.statusTone === "appeal" ? "text-error" : "text-on-surface"
            }`}
          >
            {item.stake}
          </div>
        </div>
      </div>
      <div className="p-5 flex-1 grid grid-cols-2 gap-4">
        <div>
          <div className="font-label-technical text-[10px] text-on-surface-variant mb-1">
            Project / Chain
          </div>
          <div className="font-label-technical text-[12px] text-on-surface flex items-center gap-2">
            {item.projectImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.projectImage}
                alt=""
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : null}
            {item.project ?? item.policyTitle}
          </div>
        </div>
        <div>
          <div className="font-label-technical text-[10px] text-on-surface-variant mb-1">
            Claimant Reputation
          </div>
          <div className="font-label-technical text-[12px] text-on-surface flex items-center gap-2">
            <Icon
              name={item.statusTone === "open" || item.statusTone === "pending" ? "help" : "shield"}
              className={`text-[14px] ${item.statusTone === "appeal" ? "text-tertiary" : ""}`}
            />
            {item.reputation ?? (item.seed ? "Unverified" : "On-chain filing")}
          </div>
        </div>
        <div className="col-span-2 mt-2">
          <div className="flex justify-between font-label-technical text-[10px] mb-2">
            <span className="text-on-surface-variant">{item.meterLabel}</span>
            {item.windowSeconds ? (
              <Countdown
                initialSeconds={item.windowSeconds}
                className={
                  item.statusTone === "appeal"
                    ? "text-error font-semibold"
                    : "text-tertiary"
                }
              />
            ) : (
              <span
                className={
                  item.statusTone === "appeal" ? "text-error font-semibold" : "text-tertiary"
                }
              >
                {item.meterValue}
              </span>
            )}
          </div>
          {item.windowSeconds ? (
            <CountdownBar
              initialSeconds={item.windowSeconds}
              tone={item.statusTone === "appeal" ? "error" : "tertiary"}
            />
          ) : (
            <div className="w-full flex gap-1 h-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 ${
                    index < (item.filled ?? 0)
                      ? item.statusTone === "appeal"
                        ? "bg-error/80 border border-error"
                        : "bg-tertiary/80 border border-tertiary"
                      : "bg-surface-container-high border border-outline-variant/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/30 flex justify-between items-center">
        <span className="font-label-technical text-[10px] text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
          <Icon name="public" className="text-[14px]" /> Live Public Data
        </span>
        <Link
          href={href}
          className="font-label-technical text-label-technical text-on-surface border border-outline-variant px-4 py-2 hover:bg-surface-container-high transition-colors flex items-center gap-2"
        >
          {item.statusTone === "open" || item.statusTone === "pending"
            ? "Open Docket"
            : "Review Evidence"}{" "}
          <Icon name="arrow_outward" className="text-[14px]" />
        </Link>
      </div>
    </article>
  );
}

function BrowseCasesInner() {
  const searchParams = useSearchParams();
  const urlFilter = searchParams.get("filter");
  const [filter, setFilter] = useState<Filter>(
    urlFilter === "open" ||
      urlFilter === "resolved" ||
      urlFilter === "appeal"
      ? urlFilter
      : "all",
  );
  const [query, setQuery] = useState("");
  const { cases, setActiveCase, loading, lastError } = useCourt();

  const visible = useMemo(() => {
    return cases.filter((item) => {
      if (!matchesFilter(item.statusTone, filter)) return false;
      const haystack =
        `${item.wallet} ${item.docket} ${item.status} ${item.policyTitle}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [cases, filter, query]);

  return (
    <main className="pt-8 px-margin_mobile md:px-margin_desktop pb-24 min-h-[calc(100dvh-80px)]">
      <div className="mb-12 border-b border-outline-variant pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline-xl text-[40px] md:text-headline-xl mb-4">
            Case Log
          </h1>
          <p className="text-on-surface-variant font-label-technical text-label-technical max-w-2xl leading-relaxed">
            Live feed of active disputes, sybil detection appeals, and resolved
            protocol cases. Monitor validator consensus and real-time state
            changes across all integrated networks.
          </p>
        </div>
        <div className="flex gap-4 items-center bg-surface-container p-2 border border-outline-variant">
          <div className="flex items-center gap-2 px-3 border-r border-outline-variant">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(207,188,255,0.6)]" />
            <span className="font-label-technical text-label-technical text-primary">
              Live Sync
            </span>
          </div>
          <div className="px-3 font-label-technical text-label-technical text-on-surface-variant">
            Open filings:{" "}
            <span className="text-on-surface">
              {loading ? "…" : cases.length}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-3 bg-surface-container p-4 border border-outline-variant flex flex-wrap gap-4 items-center">
          <span className="font-label-technical text-label-technical text-on-surface-variant uppercase mr-4 flex items-center gap-2">
            <Icon name="tune" className="text-[16px]" /> Filters
          </span>
          <div className="flex bg-background border border-outline-variant overflow-hidden">
            {(
              [
                ["all", "All"],
                ["open", "Open"],
                ["resolved", "Resolved"],
                ["appeal", "Appeal"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-4 py-2 font-label-technical text-label-technical border-r border-outline-variant last:border-r-0 ${
                  filter === key
                    ? key === "appeal"
                      ? "bg-error-container text-on-error"
                      : "bg-primary-container text-on-primary-container"
                    : "text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative ml-auto w-full md:w-auto">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]"
            />
            <input
              className="w-full md:w-64 bg-background border border-outline-variant py-2 pl-10 pr-4 font-label-technical text-label-technical text-on-surface focus:border-primary outline-none"
              placeholder="Search Wallet or Hash..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="bg-surface-container p-4 border border-outline-variant flex items-center justify-between">
          <div>
            <div className="font-label-technical text-label-technical text-on-surface-variant mb-1">
              Session Cases
            </div>
            <div className="font-stat-value text-stat-value text-primary tracking-tight">
              {cases.filter((item) => !item.seed).length}
            </div>
          </div>
          <div className="w-12 h-12 border border-primary/30 flex items-center justify-center bg-primary/10">
            <Icon name="account_balance_wallet" className="text-primary" />
          </div>
        </div>
      </div>
      {lastError ? (
        <p className="mb-6 font-label-technical text-label-technical text-error whitespace-pre-wrap break-all">
          {lastError}
        </p>
      ) : null}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visible.map((item) => (
          <div key={item.id} onClick={() => setActiveCase(item.id)}>
            <CaseCard item={item} />
          </div>
        ))}
      </div>
      {loading ? (
        <p className="mt-8 font-label-technical text-label-technical text-on-surface-variant">
          Reading the on-chain docket…
        </p>
      ) : visible.length === 0 ? (
        <p className="mt-8 font-label-technical text-label-technical text-on-surface-variant">
          No on-chain cases match this filter.
        </p>
      ) : null}
    </main>
  );
}

export default function BrowseCasesPage() {
  return (
    <AppShell sidebar sidebarActive="cases" dock>
      <Suspense
        fallback={
          <main className="p-margin_desktop font-label-technical text-label-technical text-on-surface-variant">
            Loading docket...
          </main>
        }
      >
        <BrowseCasesInner />
      </Suspense>
    </AppShell>
  );
}

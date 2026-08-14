"use client";

import Link from "next/link";
import { useCourt } from "@/components/providers/CourtProvider";
import { AppShell } from "@/components/shell/AppShell";
import { Icon } from "@/components/ui/Icon";
import { dashboard } from "@/lib/content";
import { shortenAddress } from "@/lib/format";
import { routes } from "@/lib/routes";

export default function DashboardPage() {
  const { address, cases } = useCourt();
  const mine = cases.filter((item) => !item.seed);
  const displayWallet = address ? shortenAddress(address) : dashboard.wallet;
  const openMine = mine.filter((item) => item.statusTone !== "appeal");
  const appealMine = mine.filter((item) => item.statusTone === "appeal");

  return (
    <AppShell sidebar sidebarActive="cases" dock>
      <main className="p-margin_mobile md:p-margin_desktop min-h-[calc(100dvh-80px)] pb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-outline-variant pb-6">
          <div>
            <h1 className="font-headline-xl text-[40px] md:text-headline-xl text-on-surface mb-2">
              My Cases
            </h1>
            <div className="font-label-technical text-label-technical text-on-surface-variant flex items-center gap-2">
              <Icon name="account_balance_wallet" className="text-[14px]" />
              Wallet Passport:{" "}
              <span className="text-primary font-bold">{displayWallet}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              className="bg-surface-container text-on-surface border border-outline-variant px-4 py-2 font-label-technical text-label-technical hover:bg-surface-variant"
            >
              Export CSV
            </button>
            <Link
              href={routes.passport}
              className="bg-primary text-on-primary px-4 py-2 font-label-technical text-label-technical hover:brightness-110 flex items-center gap-2"
            >
              View Passport
              <Icon name="arrow_outward" className="text-[14px]" />
            </Link>
          </div>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface-container border border-outline-variant p-6 relative overflow-hidden group">
            <div className="font-label-technical text-label-technical text-on-surface-variant mb-4 flex justify-between items-center">
              Total Staked
              <Icon name="fiber_manual_record" className="text-primary text-[16px]" />
            </div>
            <div className="font-stat-value text-stat-value text-on-surface mb-2">
              {dashboard.staked}{" "}
              <span className="text-xl text-on-surface-variant">SBL</span>
            </div>
            <div className="w-full h-1 bg-surface-variant mt-4 flex gap-1">
              <div className="h-full bg-primary w-1/3" />
              <div className="h-full bg-primary w-1/4" />
              <div className="h-full bg-primary w-1/6" />
            </div>
          </div>
          <div className="bg-surface-container border border-outline-variant p-6">
            <div className="font-label-technical text-label-technical text-on-surface-variant mb-4 flex justify-between items-center">
              Win Rate
              <Icon name="trending_up" className="text-tertiary text-[16px]" />
            </div>
            <div className="font-stat-value text-stat-value text-on-surface mb-2">
              {dashboard.winRate}
            </div>
            <div className="w-full h-1 bg-surface-variant mt-4 flex gap-1">
              <div className="h-full bg-tertiary w-full" />
            </div>
          </div>
          <div className="bg-surface-container border border-outline-variant p-6 relative flex flex-col justify-center items-center">
            <div className="font-label-technical text-label-technical text-on-surface-variant absolute top-6 left-6">
              Network Status
            </div>
            <div className="w-32 h-32 border-2 border-primary/20 rounded-full flex items-center justify-center mt-4">
              <div className="w-24 h-24 border-2 border-primary/40 rounded-full flex items-center justify-center animate-pulse">
                <Icon name="hub" className="text-primary text-[32px]" />
              </div>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="bg-surface border border-outline-variant flex flex-col">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-label-technical text-label-technical text-on-surface uppercase tracking-widest">
                Open Submissions
              </h3>
              <span className="bg-surface-variant text-on-surface px-2 py-1 text-[10px] font-label-technical">
                {openMine.length + dashboard.open.length} Active
              </span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {openMine.map((item) => (
                <Link
                  key={item.id}
                  href={routes.case(item.id)}
                  className="flex items-center justify-between p-3 border border-outline-variant/50 hover:bg-surface-container group"
                >
                  <div>
                    <div className="font-label-technical text-primary text-[10px] mb-1">
                      {item.docket}
                    </div>
                    <div className="font-body-md text-on-surface break-all">
                      {item.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-label-technical text-[10px] text-on-surface-variant">
                        Stake
                      </div>
                      <div className="font-label-technical text-on-surface">
                        {item.stake}
                      </div>
                    </div>
                    <Icon
                      name="chevron_right"
                      className="text-on-surface-variant group-hover:text-primary"
                    />
                  </div>
                </Link>
              ))}
              {dashboard.open.map((item) => (
                <Link
                  key={item.id}
                  href={routes.case("8842-ax")}
                  className="flex items-center justify-between p-3 border border-outline-variant/50 hover:bg-surface-container group"
                >
                  <div>
                    <div className="font-label-technical text-primary text-[10px] mb-1">
                      {item.id}
                    </div>
                    <div className="font-body-md text-on-surface">{item.title}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-label-technical text-[10px] text-on-surface-variant">
                        Stake
                      </div>
                      <div className="font-label-technical text-on-surface">
                        {item.stake}
                      </div>
                    </div>
                    <Icon
                      name="chevron_right"
                      className="text-on-surface-variant group-hover:text-primary"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-surface border border-outline-variant flex flex-col">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-label-technical text-label-technical text-on-surface uppercase tracking-widest">
                Under Appeal
              </h3>
              <span className="bg-error-container/20 text-error px-2 py-1 text-[10px] font-label-technical border border-error/30">
                {appealMine.length + dashboard.appeal.length} Pending
              </span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {appealMine.map((item) => (
                <Link
                  key={item.id}
                  href={routes.case(item.id)}
                  className="flex items-center justify-between p-3 border border-error/20 bg-error-container/5 hover:bg-surface-container group"
                >
                  <div>
                    <div className="font-label-technical text-error text-[10px] mb-1 flex items-center gap-1">
                      <Icon name="warning" className="text-[12px]" />
                      {item.docket}
                    </div>
                    <div className="font-body-md text-on-surface break-all">
                      {item.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-label-technical text-[10px] text-on-surface-variant">
                        At Risk
                      </div>
                      <div className="font-label-technical text-error">{item.stake}</div>
                    </div>
                    <Icon
                      name="chevron_right"
                      className="text-on-surface-variant group-hover:text-error"
                    />
                  </div>
                </Link>
              ))}
              {dashboard.appeal.map((item) => (
                <Link
                  key={item.id}
                  href={routes.case("8842-ax")}
                  className="flex items-center justify-between p-3 border border-error/20 bg-error-container/5 hover:bg-surface-container group"
                >
                  <div>
                    <div className="font-label-technical text-error text-[10px] mb-1 flex items-center gap-1">
                      <Icon name="warning" className="text-[12px]" />
                      {item.id}
                    </div>
                    <div className="font-body-md text-on-surface">{item.title}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-label-technical text-[10px] text-on-surface-variant">
                        At Risk
                      </div>
                      <div className="font-label-technical text-error">{item.stake}</div>
                    </div>
                    <Icon
                      name="chevron_right"
                      className="text-on-surface-variant group-hover:text-error"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-surface border border-outline-variant overflow-x-auto">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low">
            <h3 className="font-label-technical text-label-technical text-on-surface uppercase tracking-widest">
              Resolved Cases (Recent)
            </h3>
          </div>
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-lowest">
                {["ID", "Subject", "Outcome", "Reward", "Date"].map((label) => (
                  <th
                    key={label}
                    className="p-4 font-label-technical text-[10px] text-on-surface-variant uppercase"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dashboard.resolved.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-outline-variant/30 hover:bg-surface-container ${
                    row.outcome === "DISMISSED" ? "opacity-60" : ""
                  }`}
                >
                  <td className="p-4 font-label-technical text-[12px] text-on-surface">
                    {row.id}
                  </td>
                  <td className="p-4 font-body-md text-on-surface">{row.subject}</td>
                  <td className="p-4">
                    <span
                      className={`font-label-technical text-[10px] px-2 py-1 border ${
                        row.outcome === "UPHELD"
                          ? "text-tertiary bg-tertiary-container/20 border-tertiary/30"
                          : "text-on-surface-variant bg-surface-variant border-outline-variant"
                      }`}
                    >
                      {row.outcome}
                    </span>
                  </td>
                  <td
                    className={`p-4 font-label-technical text-[12px] ${
                      row.outcome === "UPHELD" ? "text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {row.reward}
                  </td>
                  <td className="p-4 font-label-technical text-[12px] text-on-surface-variant">
                    {row.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </AppShell>
  );
}

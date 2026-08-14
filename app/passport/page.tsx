"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useCourt } from "@/components/providers/CourtProvider";
import { AppShell } from "@/components/shell/AppShell";
import { Icon } from "@/components/ui/Icon";
import { passport } from "@/lib/content";
import { featuredCase } from "@/lib/content";
import { shortenAddress } from "@/lib/format";
import { routes } from "@/lib/routes";

const outcomeClass = {
  primary: "bg-primary/10 text-primary border-primary/30",
  tertiary: "bg-tertiary/10 text-tertiary border-tertiary/30",
  error: "bg-error/10 text-error border-error/30",
};

export default function PassportPage() {
  const { address } = useAccount();
  const { cases } = useCourt();
  const displayAddress = address ? shortenAddress(address, 3, 4) : passport.address;
  const mine = cases.filter((item) => !item.seed);

  return (
    <AppShell sidebar sidebarActive="filter" dock>
      <header className="px-margin_mobile md:px-margin_desktop py-12 border-b border-outline-variant bg-surface-container/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Icon name="verified_user" className="text-primary text-3xl" fill />
              <h1 className="font-headline-xl text-[36px] md:text-headline-xl text-on-surface break-all">
                {displayAddress}
              </h1>
            </div>
            <div className="flex gap-4 items-center mt-2 flex-wrap">
              <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-1 font-label-technical text-label-technical uppercase flex items-center gap-1">
                <Icon name="fiber_manual_record" className="text-sm" fill /> Live Status
              </span>
              <span className="font-label-technical text-label-technical text-on-surface-variant">
                {passport.lastActive}
              </span>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col items-end">
              <span className="font-label-technical text-label-technical text-on-surface-variant uppercase mb-1">
                Reputation Score
              </span>
              <span className="font-stat-value text-stat-value text-primary">
                {passport.score}
                <span className="text-outline text-2xl">/100</span>
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-label-technical text-label-technical text-on-surface-variant uppercase mb-1">
                Win Rate
              </span>
              <span className="font-stat-value text-stat-value text-tertiary">
                {passport.winRate}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-label-technical text-label-technical text-on-surface-variant uppercase mb-1">
                Total Cases
              </span>
              <span className="font-stat-value text-stat-value text-on-surface">
                {passport.totalCases}
              </span>
            </div>
          </div>
        </div>
      </header>
      <section className="px-margin_mobile md:px-margin_desktop py-12 max-w-7xl mx-auto w-full">
        <div className="mb-12 bg-surface-container-high border-l-4 border-error p-8 relative">
          <div className="absolute -top-4 left-6 bg-error text-on-error font-label-technical text-label-technical uppercase px-4 py-1">
            Latest Written Verdict
          </div>
          <div className="mt-4 font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-4xl space-y-4">
            <p className="font-label-technical text-label-technical text-primary uppercase">
              {featuredCase.docket} / {featuredCase.title}
            </p>
            {featuredCase.verdict.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className="font-label-technical text-label-technical text-on-surface mt-4 pt-4 border-t border-outline-variant/30">
              {featuredCase.signature}
            </p>
          </div>
        </div>
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Immutable Ledger
            </h2>
            <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
              Public, permanent record of all case participations. Entries cannot
              be modified or hidden.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              className="border border-outline-variant bg-surface-container text-on-surface font-label-technical text-label-technical px-4 py-2 hover:bg-surface-container-high uppercase flex items-center gap-2"
            >
              <Icon name="filter_list" className="text-sm" /> Filter
            </button>
            <button
              type="button"
              className="border border-outline-variant bg-surface-container text-on-surface font-label-technical text-label-technical px-4 py-2 hover:bg-surface-container-high uppercase flex items-center gap-2"
            >
              <Icon name="download" className="text-sm" /> Export CSV
            </button>
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-outline-variant">
                  <th className="py-4 px-6 font-label-technical text-label-technical text-on-surface-variant uppercase">
                    Case ID
                  </th>
                  <th className="py-4 px-6 font-label-technical text-label-technical text-on-surface-variant uppercase">
                    Policy Name
                  </th>
                  <th className="py-4 px-6 font-label-technical text-label-technical text-on-surface-variant uppercase">
                    Role
                  </th>
                  <th className="py-4 px-6 font-label-technical text-label-technical text-on-surface-variant uppercase">
                    Outcome
                  </th>
                  <th className="py-4 px-6 font-label-technical text-label-technical text-on-surface-variant uppercase text-right">
                    Date (UTC)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 font-label-technical text-label-technical text-on-surface">
                {mine.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-high/50">
                    <td className="py-4 px-6 text-primary">
                      <Link href={routes.case(item.id)}>{item.docket}</Link>
                    </td>
                    <td className="py-4 px-6">{item.policyTitle}</td>
                    <td className="py-4 px-6">Claimant</td>
                    <td className="py-4 px-6">
                      <span className="bg-tertiary/10 text-tertiary border border-tertiary/30 px-2 py-1 inline-block uppercase text-xs">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-on-surface-variant">
                      Session
                    </td>
                  </tr>
                ))}
                {passport.rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-surface-container-high/50 ${row.muted ? "opacity-75" : ""}`}
                  >
                    <td className="py-4 px-6 text-primary">
                      <Link href={routes.case("8842-ax")}>{row.id}</Link>
                    </td>
                    <td className="py-4 px-6">{row.policy}</td>
                    <td className="py-4 px-6">{row.role}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`border px-2 py-1 inline-block uppercase text-xs ${outcomeClass[row.tone]}`}
                      >
                        {row.outcome}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-on-surface-variant">
                      {row.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-surface-container-high border-t border-outline-variant p-4 flex justify-between items-center">
            <span className="font-label-technical text-label-technical text-on-surface-variant">
              Showing 1-5 of 142 records
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1 border border-outline-variant bg-surface-container text-outline"
              >
                &lt;
              </button>
              <button
                type="button"
                className="px-3 py-1 border border-outline-variant bg-surface-container text-outline"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

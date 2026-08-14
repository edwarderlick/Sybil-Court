"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { Icon } from "@/components/ui/Icon";
import { leaderboard } from "@/lib/content";
import { routes } from "@/lib/routes";

export default function LeaderboardPage() {
  const [range, setRange] = useState<"24h" | "7d" | "all">("7d");

  return (
    <AppShell sidebar sidebarActive="governance" dock>
      <main className="p-margin_mobile md:p-gutter min-h-[calc(100dvh-80px)]">
        <header className="mb-gutter flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline-xl text-[40px] md:text-display-lg text-on-surface uppercase mb-2">
              Global Rankings
            </h1>
            <p className="text-on-surface-variant font-label-technical text-label-technical uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary pulse-live inline-block" />
              Live Operator Status
            </p>
          </div>
          <div className="flex flex-wrap gap-2 font-label-technical text-label-technical uppercase">
            <div className="bg-surface-container border border-outline-variant flex">
              {(
                [
                  ["24h", "24H"],
                  ["7d", "7D"],
                  ["all", "All Time"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRange(key)}
                  className={`px-4 py-2 border-r border-outline-variant last:border-r-0 ${
                    range === key
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high flex items-center gap-2"
            >
              <Icon name="filter_alt" className="text-[16px]" /> Network Filter
            </button>
          </div>
        </header>
        <div className="bg-surface border border-outline-variant overflow-hidden isometric-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low font-label-technical text-label-technical text-on-surface-variant uppercase">
                  <th className="p-4 w-16 text-center">Rank</th>
                  <th className="p-4">Operator Entity</th>
                  <th className="p-4 text-right">Resolved Cases</th>
                  <th className="p-4 text-right">Win Rate</th>
                  <th className="p-4 text-right">Total Stake (GEN)</th>
                </tr>
              </thead>
              <tbody className="font-body-md">
                {leaderboard.map((row) => (
                  <tr
                    key={row.rank}
                    className="border-b border-outline-variant/30 hover:bg-surface-container-high/50 group"
                  >
                    <td
                      className={`p-4 text-center font-stat-value text-[24px] ${
                        row.highlight ? "text-tertiary" : "text-on-surface-variant"
                      }`}
                    >
                      {row.rank}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 border flex items-center justify-center ${
                            row.highlight
                              ? "bg-tertiary/20 border-tertiary/50 text-tertiary"
                              : "bg-surface-container-highest border-outline-variant text-on-surface-variant"
                          }`}
                        >
                          <Icon name={row.icon} className="text-[18px]" />
                        </div>
                        <div>
                          <Link
                            href={routes.passport}
                            className="text-on-surface font-bold hover:text-primary flex items-center gap-1"
                          >
                            {row.address}
                            <Icon
                              name="open_in_new"
                              className="text-[14px] opacity-0 group-hover:opacity-100"
                            />
                          </Link>
                          <div className="text-on-surface-variant font-label-technical text-label-technical text-[10px]">
                            {row.org}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-label-technical text-label-technical">
                      {row.resolved}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-on-surface">{row.winRate}</span>
                        <div className="w-16 h-1 bg-surface-container-highest overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: row.winWidth }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-label-technical text-label-technical text-primary">
                      {row.stake}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-surface-container-low border-t border-outline-variant flex justify-center">
            <button
              type="button"
              className="text-on-surface-variant font-label-technical text-label-technical hover:text-primary uppercase tracking-widest flex items-center gap-2"
            >
              Load Next 50 <Icon name="expand_more" className="text-[16px]" />
            </button>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

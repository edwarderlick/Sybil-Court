"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { routes, sideNav, sideNavFooter, type SideNavKey } from "@/lib/routes";

export function SideNav({ active = "cases" }: { active?: SideNavKey }) {
  return (
    <aside className="hidden md:flex fixed left-0 top-20 h-[calc(100dvh-80px)] w-64 border-r border-outline-variant bg-surface-container-low flex-col py-grid_unit overflow-y-auto z-40">
      <div className="px-6 py-6 border-b border-outline-variant/30 mb-4">
        <div className="font-label-technical text-label-technical text-on-surface-variant mb-1 uppercase">
          Protocol Layer 02
        </div>
        <div className="font-headline-lg text-headline-lg text-on-surface">
          Operations
        </div>
        <div className="text-xs text-outline mt-2 italic flex items-center gap-2">
          <Icon name="account_circle" className="text-[14px]" /> Court Operator
        </div>
        <Link
          href={routes.submit}
          className="mt-6 w-full border border-tertiary text-tertiary font-label-technical text-label-technical uppercase py-2 hover:bg-tertiary hover:text-on-tertiary transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="add" className="text-[16px]" /> New Appeal
        </Link>
      </div>
      <nav className="flex-1 flex flex-col gap-1 px-2">
        {sideNav.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`font-label-technical text-label-technical uppercase px-4 py-3 flex items-center gap-3 transition-colors ${
                isActive
                  ? "bg-tertiary-container text-on-tertiary-container border-l-4 border-tertiary"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <Icon name={item.icon} fill={isActive} /> {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-outline-variant/30 pt-4 px-2 pb-4 flex flex-col gap-1">
        {sideNavFooter.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="font-label-technical text-label-technical uppercase text-on-surface-variant hover:bg-surface-container-high transition-colors px-4 py-3 flex items-center gap-3"
          >
            <Icon name={item.icon} /> {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { routes, topNav } from "@/lib/routes";
import { WalletChip } from "./WalletChip";

export function TopNav({
  variant = "app",
}: {
  variant?: "marketing" | "app";
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-outline-variant bg-background/80 backdrop-blur-md">
      <div className="flex justify-between items-center w-full px-margin_mobile md:px-margin_desktop h-20">
        <div className="flex items-center gap-8 lg:gap-12">
          <Link href={routes.home} className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Sybil Court"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
            <span className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-[22px] font-bold tracking-tighter text-on-background uppercase">
              Sybil Court
            </span>
          </Link>
          <div className="hidden lg:flex items-center gap-6">
            {topNav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-label-technical text-label-technical uppercase transition-colors px-2 py-1 ${
                    active
                      ? "text-primary border-b-2 border-primary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {variant === "marketing" ? (
            <Link
              href={routes.howJudgments}
              className="hidden md:inline font-label-technical text-label-technical text-on-surface-variant hover:text-on-surface uppercase"
            >
              How Judgments Work
            </Link>
          ) : null}
          <WalletChip compact className="hidden sm:flex" />
          <button
            type="button"
            className="lg:hidden text-on-surface p-2"
            onClick={() => setOpen((value) => !value)}
            aria-label="Open menu"
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      {open ? (
        <div className="lg:hidden border-t border-outline-variant bg-surface-container-low px-margin_mobile py-4 flex flex-col gap-2">
          {topNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-label-technical text-label-technical uppercase text-on-surface py-3 border-b border-outline-variant/40"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={routes.dashboard}
            onClick={() => setOpen(false)}
            className="font-label-technical text-label-technical uppercase text-on-surface py-3 border-b border-outline-variant/40"
          >
            My Cases
          </Link>
          <Link
            href={routes.activity}
            onClick={() => setOpen(false)}
            className="font-label-technical text-label-technical uppercase text-on-surface py-3"
          >
            Live Activity
          </Link>
          <WalletChip className="sm:hidden mt-2 w-full justify-center" />
        </div>
      ) : null}
    </nav>
  );
}

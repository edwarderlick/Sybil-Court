"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { routes } from "@/lib/routes";

const items = [
  { href: routes.cases, label: "Cases", icon: "gavel" },
  { href: routes.activity, label: "Feed", icon: "explore" },
  { href: routes.leaderboard, label: "Ranks", icon: "leaderboard" },
  { href: routes.dashboard, label: "Mine", icon: "person" },
];

export function MobileDock() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-surface-container-low border-t border-outline-variant flex justify-around items-center h-16 z-50">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full ${
              active
                ? "text-primary border-t-2 border-primary bg-primary-container/10"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Icon name={item.icon} className="text-xl" fill={active} />
            <span className="text-[10px] font-label-technical mt-1 uppercase">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

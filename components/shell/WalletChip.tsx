"use client";

import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";
import { useMounted } from "@/components/providers/CourtProvider";
import { Icon } from "@/components/ui/Icon";
import { shortenAddress } from "@/lib/format";
import { routes } from "@/lib/routes";

export function WalletChip({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const mounted = useMounted();

  if (!mounted || !isConnected || !address) {
    return (
      <Link
        href={routes.connect}
        className={`font-label-technical text-label-technical bg-primary text-on-primary px-4 md:px-6 py-2 md:py-3 uppercase tracking-wider hover:bg-primary-fixed transition-colors flex items-center gap-2 ${className}`}
      >
        Connect Passport
        {!compact ? (
          <Icon name="account_balance_wallet" className="text-[16px]" />
        ) : null}
      </Link>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Link
        href={routes.passport}
        className="font-label-technical text-label-technical bg-surface-container-high text-on-surface border border-outline-variant px-4 py-2 uppercase flex items-center gap-2 hover:bg-surface-container transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-primary pulse-live" />
        {shortenAddress(address)}
      </Link>
      <button
        type="button"
        onClick={() => disconnect()}
        className="hidden md:inline-flex font-label-technical text-label-technical text-on-surface-variant border border-outline-variant px-3 py-2 uppercase hover:text-on-surface hover:bg-surface-container-high transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}

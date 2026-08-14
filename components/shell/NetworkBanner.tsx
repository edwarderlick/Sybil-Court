"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { useMounted } from "@/components/providers/CourtProvider";
import { Icon } from "@/components/ui/Icon";
import { genlayerStudio } from "@/lib/chain";

export function NetworkBanner() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();
  const mounted = useMounted();

  if (!mounted || !isConnected || chainId === genlayerStudio.id) return null;

  return (
    <div className="bg-error-container/20 border-b border-error/30 px-margin_mobile md:px-margin_desktop py-3 flex items-start md:items-center gap-4">
      <Icon name="warning" className="text-error mt-0.5" />
      <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="font-label-technical text-label-technical text-error uppercase font-bold">
            Network Mismatch Detected
          </h3>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            Current connection invalid. Please switch to{" "}
            <span className="text-on-surface font-semibold">
              GenLayer Studio Testnet
            </span>{" "}
            to proceed with operations.
          </p>
          {error ? (
            <p className="font-label-technical text-[11px] text-error mt-2">
              {error.message}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => switchChain({ chainId: genlayerStudio.id })}
          className="bg-error text-on-error font-label-technical text-label-technical px-4 py-2 uppercase hover:bg-error/90 transition-colors flex items-center gap-2 shrink-0 disabled:opacity-60"
        >
          {isPending ? "Switching" : "Switch Network"}
          <Icon name="swap_horiz" className="text-sm" />
        </button>
      </div>
    </div>
  );
}

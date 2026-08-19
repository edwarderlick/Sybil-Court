"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount, useConnect, useSwitchChain } from "wagmi";
import { Icon } from "@/components/ui/Icon";
import { ShaderBackground } from "@/components/visual/ShaderBackground";
import { genlayerStudio } from "@/lib/chain";
import { routes } from "@/lib/routes";

export default function ConnectPage() {
  const router = useRouter();
  const { isConnected, chainId } = useAccount();
  const { connect, connectors, isPending, error, variables } = useConnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const injected = connectors.find((item) => item.type === "injected") ?? connectors[0];
  const wrongNetwork = isConnected && chainId !== genlayerStudio.id;

  useEffect(() => {
    if (isConnected && !wrongNetwork) {
      router.replace(routes.cases);
    }
  }, [isConnected, wrongNetwork, router]);

  const connectInjected = () => {
    if (injected) connect({ connector: injected });
  };

  return (
    <div className="min-h-[100dvh] relative overflow-hidden font-body-md text-body-md technical-grid flex items-center justify-center p-margin_mobile md:p-margin_desktop">
      <ShaderBackground className="opacity-70" />
      <main className="relative z-10 w-full max-w-2xl bg-surface-container-low border border-outline-variant shadow-2xl flex flex-col">
        <header className="p-gutter border-b border-outline-variant flex justify-between items-center bg-surface-container/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Icon name="account_balance_wallet" className="text-primary text-3xl" />
            <div>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface uppercase tracking-tight">
                System Access
              </h1>
              <p className="font-label-technical text-label-technical text-on-surface-variant uppercase mt-1">
                Authenticate via Web3 Protocol
              </p>
            </div>
          </div>
          <Link
            href={routes.home}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-2"
            aria-label="Close"
          >
            <Icon name="close" />
          </Link>
        </header>
        {wrongNetwork ? (
          <div className="bg-error-container/20 border-b border-error/30 p-4 flex items-start gap-4">
            <Icon name="warning" className="text-error mt-0.5" />
            <div className="flex-1">
              <h3 className="font-label-technical text-label-technical text-error uppercase font-bold">
                Network Mismatch Detected
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Current connection invalid. Please switch to{" "}
                <span className="text-on-surface font-semibold">
                  GenLayer Studio Testnet
                </span>{" "}
                to proceed with operations.
              </p>
              <button
                type="button"
                onClick={() => switchChain({ chainId: genlayerStudio.id })}
                className="mt-3 bg-error text-on-error font-label-technical text-label-technical px-4 py-2 uppercase hover:bg-error/90 transition-colors flex items-center gap-2"
              >
                {isSwitching ? "Switching" : "Switch Network"}
                <Icon name="swap_horiz" className="text-sm" />
              </button>
            </div>
          </div>
        ) : null}
        <div className="p-gutter flex flex-col gap-4">
          <button
            type="button"
            onClick={connectInjected}
            disabled={isPending}
            className="group relative w-full bg-surface border border-outline-variant p-4 flex items-center justify-between hover:border-primary hover:bg-surface-container-high transition-all disabled:opacity-60"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-container text-on-primary-container flex items-center justify-center border border-primary/30">
                <Icon name="fingerprint" />
              </div>
              <div className="text-left">
                <div className="font-label-technical text-label-technical text-on-surface uppercase font-bold">
                  Connect Wallet
                </div>
                <div className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
                  Recommended for Sybil Court Operators
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-label-technical text-label-technical text-primary uppercase text-[10px] border border-primary/30 px-2 py-1 bg-primary/10">
                Priority
              </span>
              <Icon
                name="arrow_forward"
                className="text-on-surface-variant group-hover:text-primary transition-colors"
              />
            </div>
          </button>
          <button
            type="button"
            onClick={connectInjected}
            disabled={isPending}
            className="group relative w-full bg-surface border border-outline-variant p-4 flex items-center justify-between hover:border-tertiary hover:bg-surface-container-high transition-all disabled:opacity-60"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-tertiary-container text-on-tertiary-container flex items-center justify-center border border-tertiary/30">
                <Icon name="token" />
              </div>
              <div className="text-left">
                <div className="font-label-technical text-label-technical text-on-surface uppercase font-bold">
                  MetaMask
                </div>
                <div className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
                  Browser Extension
                </div>
              </div>
            </div>
            <Icon
              name="arrow_forward"
              className="text-on-surface-variant group-hover:text-tertiary transition-colors"
            />
          </button>
          <button
            type="button"
            onClick={connectInjected}
            disabled={isPending}
            className="group relative w-full bg-surface border border-outline-variant p-4 flex items-center justify-between hover:border-secondary hover:bg-surface-container-high transition-all disabled:opacity-60"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary-container text-on-secondary-container flex items-center justify-center border border-secondary/30">
                <Icon name="qr_code_scanner" />
              </div>
              <div className="text-left">
                <div className="font-label-technical text-label-technical text-on-surface uppercase font-bold">
                  WalletConnect
                </div>
                <div className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
                  Uses the injected browser wallet until a WalletConnect project
                  ID is configured.
                </div>
              </div>
            </div>
            <Icon
              name="arrow_forward"
              className="text-on-surface-variant group-hover:text-secondary transition-colors"
            />
          </button>
          {error ? (
            <p className="font-label-technical text-label-technical text-error">
              {error.message}
            </p>
          ) : null}
          {isPending && variables ? (
            <p className="font-label-technical text-label-technical text-primary">
              Waiting for wallet approval...
            </p>
          ) : null}
        </div>
        <footer className="p-4 border-t border-outline-variant bg-surface-container-lowest text-center">
          <p className="font-label-technical text-label-technical text-on-surface-variant text-xs">
            By connecting, you agree to the{" "}
            <Link className="text-primary hover:underline" href={routes.howJudgments}>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link className="text-primary hover:underline" href={routes.howJudgments}>
              Privacy Policy
            </Link>
            .
          </p>
        </footer>
      </main>
    </div>
  );
}

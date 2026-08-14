import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { Account, Address } from "viem";

export const SYBIL_COURT_ADDRESS = (process.env
  .NEXT_PUBLIC_SYBIL_COURT_ADDRESS ??
  "0xFCA5d6960da9833f241c98f5677a0284534B7723") as Address;

export const STUDIO_RPC =
  process.env.NEXT_PUBLIC_GENLAYER_RPC ?? "https://studio.genlayer.com/api";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
};

function browserRpcUrl() {
  if (typeof window !== "undefined") return "/api/genlayer";
  return STUDIO_RPC;
}

export function getCourtChain() {
  return {
    ...studionet,
    rpcUrls: {
      ...studionet.rpcUrls,
      default: { http: [browserRpcUrl()] as const },
    },
  };
}

export function getReadClient() {
  return createClient({
    chain: getCourtChain(),
  });
}

export function getWriteClient(
  account: Address | Account,
  provider?: EthereumProvider,
) {
  return createClient({
    chain: getCourtChain(),
    account,
    ...(provider ? { provider } : {}),
  });
}

export function getInjectedProvider(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return window.ethereum;
}

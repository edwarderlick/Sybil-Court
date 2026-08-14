import { defineChain } from "viem";

const chainId = Number(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID ?? 61999);
const rpcUrl =
  process.env.NEXT_PUBLIC_GENLAYER_RPC ?? "https://studio.genlayer.com/api";

export const genlayerStudio = defineChain({
  id: chainId,
  name: "GenLayer Studio Testnet",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
});

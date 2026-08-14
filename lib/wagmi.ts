import { injected } from "@wagmi/core";
import { createConfig, http } from "wagmi";
import { genlayerStudio } from "./chain";

export const wagmiConfig = createConfig({
  chains: [genlayerStudio],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [genlayerStudio.id]: http(genlayerStudio.rpcUrls.default.http[0]),
  },
  ssr: true,
});

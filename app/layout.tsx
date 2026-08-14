import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Web3Provider } from "@/components/providers/Web3Provider";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Sybil Court",
  description:
    "Eligibility and Sybil-appeal layer for airdrops on GenLayer Studio testnet.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${jetbrains.variable} bg-background text-on-background`}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}

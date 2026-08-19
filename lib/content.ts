export const featuredCaseId = "8842-ax";

export const policyDraft = {
  title: "ZKSync Airdrop Sybil Resistance Framework",
  model: "Sybil-Detect-v4.2",
  project: "ZKSYNC SYBIL POLICY GENERATION PROTOCOL",
  sections: [
    {
      heading: "1. Primary Vector Analysis:",
      body: "Accounts identified as exhibiting cluster-funding behavior via centralized exchanges (e.g., matching withdrawal timestamps within a 5-second variance across >10 distinct addresses) will be classified as Sybil Tier A.",
    },
    {
      heading: "2. Activity Density Thresholds:",
      body: "Wallets demonstrating transactional volume primarily concentrated within a 48-hour window, followed by dormancy exceeding 90 days, shall trigger a probabilistic penalty modifier of 0.85 to final allocation metrics.",
    },
    {
      heading: "3. Inter-contract Dependency:",
      body: "Interaction with recognized industrial farming contracts (Contract Hash List Alpha-7) will result in immediate flagging for manual court review, bypassing automated distribution logic.",
    },
    {
      heading: "4. Sybil Court Adjudication:",
      body: "A Contested first verdict opens a 7-day appeal that requires twice the submit bond, sent as payable GEN.",
    },
  ],
  confidence: [
    { label: "False Positive Mitigation", value: "94.2%", width: "94.2%" },
    { label: "Cluster Detection Range", value: "88.7%", width: "88.7%", tone: "tertiary" as const },
  ],
};

export const submitPolicies = [
  {
    id: "POL-ZK-001",
    tag: "Layer 2",
    title: "Standard Sybil Resistance Framework",
    body: "Base policy governing single-entity multi-wallet interactions within standard rollup environments.",
  },
  {
    id: "POL-DF-042",
    tag: "DeFi",
    title: "Liquidity Provider Anonymity Bounds",
    body: "Strict threshold policy for overlapping LP positions across designated automated market makers.",
  },
];

export const cases = [
  {
    id: "a-9921",
    docket: "A-9921",
    status: "Active Appeal",
    statusTone: "appeal" as const,
    wallet: "0x71C...3E9A",
    stakeLabel: "BOND LOCKED",
    stake: "0.01 GEN",
    project: "Arbitrum Defi",
    projectImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAXPoMuvUBiWWC6hGJI1oU12gbS13_X2RWFHJpB1yOl9GnSXGTOvmCnBpESiJlIN6AyHAkObrGPz6vGnfnblA28muahHS6zRVIh0bThX0f5k7Nd29qJEnQJhPu75lT0BVQW8tloZXv-nvGL1qIPfd0AQjOHG8cUfuZUCy15Y3pkOJykojKZwce5hdy-cT0VWoR8zYgyyBYQeYz1C2tdWTjKf9Q7_Bsztjt6d3Y5ADsAzaNkGnjon12G",
    reputation: "84/100 (Verified)",
    meterLabel: "RESOLUTION COUNTDOWN",
    meterValue: "04:12:59",
    filled: 3,
    action: "Review Evidence",
    href: "/cases/8842-ax",
  },
  {
    id: "r-4402",
    docket: "R-4402",
    status: "Open Review",
    statusTone: "open" as const,
    wallet: "0x4B2...8F1D",
    stakeLabel: "BOND LOCKED",
    stake: "0.01 GEN",
    project: "Polygon Social",
    projectImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDoPV9MRjxinxJ616qX_GPPumWXllyt4Thc4a_NucOEUfmk7o-5WgdrzZCqiXMbm6WrHH_PxI7Ri4suJE_-jEL5rqTbneAculeBLckOC2VO1RDlNl0KegCS8BCeYGFYzE3bsM-dqLYlmybHNXg6jc9OUnYqQpiZbzMAIkZXk7kkLU9p2ST3d98V4y4pbrdd2xmaMrdAmnOsRu-Ebl92B1ZWGC7Bi3H0VgR5b4efrBlHqzy4JNVZqQaJ",
    reputation: "Unverified (41/100)",
    meterLabel: "VALIDATOR CONSENSUS",
    meterValue: "42% REACHED",
    filled: 2,
    action: "Open Docket",
    href: "/cases/r-4402",
  },
  {
    id: "s-1108",
    docket: "S-1108",
    status: "Resolved (Sybil)",
    statusTone: "resolved" as const,
    wallet: "0x99F...2C11",
    stakeLabel: "BOND SLASHED TO TREASURY",
    stake: "0.01 GEN",
    resolutionHash: "0xdef...a1b2",
    href: "/cases/s-1108",
  },
];

export const featuredCase = {
  id: "8842-ax",
  docket: "DOCKET #8842-AX",
  title: "Sybil Cluster Detection",
  status: "Awaiting Verdict Challenge",
  policy: "Airdrop Integrity V4",
  flagged: "0x7F...9A2b",
  validator: "Node_Sigma_09",
  valueAtRisk: "0.01 GEN",
  window: "14:22:09",
  windowSeconds: 14 * 3600 + 22 * 60 + 9,
  sharedIps: "14",
  appealStake: "0.02 GEN",
  verdict: [
    "Analysis of the transaction graph confirms a deterministic script execution across 14 distinct addresses originating from the same sub-net within a 12-second window. The funding source for gas fees was traced back to a single exchange deposit address (Tornado Cash obfuscation attempt bypassed via heuristic model Alpha-7).",
    'Behavioral matching indicates standard airdrop-farming activity, violating Policy Constraint 3.1.2 ("No automated Sybil generation"). The claimant\'s defense cited concurrent manual operation, which is statistically impossible given the sub-millisecond transaction sequencing observed in block 18499201.',
  ],
  signature: "SIG: 0x994...df2a // CONFIDENCE: 99.4%",
};

export const appealContext = {
  caseId: "CASE-8842-A",
  summary: "Initial Verdict: Fraudulent Identity Cluster Detected.",
  prior: "GUILTY",
  remaining: "14h 22m",
  stake: "500",
  stakeToken: "GEN",
};

export const passport = {
  address: "0x71C...97d3",
  lastActive: "Last Active: 2 mins ago",
  score: "98",
  winRate: "84%",
  totalCases: "142",
  rows: [
    {
      id: "#SC-24-0891",
      policy: "Airdrop Integrity Protocol V2",
      role: "Challenger",
      outcome: "Eligible",
      tone: "primary" as const,
      date: "2024-10-24 14:32",
    },
    {
      id: "#SC-24-0885",
      policy: "Staking Rewards Distribution",
      role: "Claimant",
      outcome: "Under Appeal",
      tone: "tertiary" as const,
      date: "2024-10-22 09:15",
    },
    {
      id: "#SC-24-0812",
      policy: "Governance Voting Weight",
      role: "Challenger",
      outcome: "Ineligible",
      tone: "error" as const,
      date: "2024-10-18 18:45",
    },
    {
      id: "#SC-24-0750",
      policy: "Airdrop Integrity Protocol V1",
      role: "Claimant",
      outcome: "Eligible",
      tone: "primary" as const,
      date: "2024-09-30 11:20",
    },
    {
      id: "#SC-24-0622",
      policy: "Liquidity Provider Verification",
      role: "Claimant",
      outcome: "Eligible",
      tone: "primary" as const,
      date: "2024-08-15 08:00",
      muted: true,
    },
  ],
};

export const leaderboard = [
  {
    rank: "#1",
    address: "0x7a8...9b2C",
    org: "Sybil Hunter Syndicate",
    resolved: "4,291",
    winRate: "94.2%",
    winWidth: "94%",
    stake: "1,250.00",
    icon: "verified",
    highlight: true,
  },
  {
    rank: "#2",
    address: "0x3f1...2a9D",
    org: "LayerZero Sentinels",
    resolved: "3,812",
    winRate: "91.8%",
    winWidth: "91%",
    stake: "980.50",
    icon: "shield",
    highlight: false,
  },
];

export const dashboard = {
  wallet: "0x7F...3B9A",
  staked: "1,245.50",
  winRate: "87.4%",
  open: [
    { id: "CASE-992-A", title: "Sybil Detection: Cluster 4A", stake: "150 SBL" },
    { id: "CASE-985-B", title: "Volume Manipulation Alert", stake: "300 SBL" },
  ],
  appeal: [
    { id: "CASE-842-X", title: "Identity Spoofing Dispute", stake: "500 SBL" },
  ],
  resolved: [
    {
      id: "CASE-771-C",
      subject: "Bot Net Identification",
      outcome: "UPHELD",
      reward: "+45 SBL",
      date: "2024-10-22",
    },
    {
      id: "CASE-765-A",
      subject: "Wash Trading Ring",
      outcome: "UPHELD",
      reward: "+120 SBL",
      date: "2024-10-18",
    },
    {
      id: "CASE-750-B",
      subject: "False Positive Report",
      outcome: "DISMISSED",
      reward: "0 SBL",
      date: "2024-10-15",
    },
  ],
};

export const activity = [
  {
    when: "JUST NOW",
    id: "#SC-9982",
    tone: "error" as const,
    icon: "gavel",
    label: "Verdict Reached",
    title: "Wallet 0x7A...3F92 flagged as malicious actor",
    body: "On-chain verdict stored. Ineligible slashes the locked bond to the treasury; Eligible returns a contract credit.",
    href: "/cases/8842-ax",
  },
  {
    when: "2M AGO",
    id: "#SB-4410",
    tone: "tertiary" as const,
    icon: "upload_file",
    label: "New Submission",
    title: "Sybil resistance appeal filed",
    body: "User claiming false positive on recent airdrop exclusion. Providing secondary biometric proof via Gitcoin Passport integration.",
    href: "/cases/a-9921",
  },
  {
    when: "15M AGO",
    id: "#PL-019",
    tone: "primary" as const,
    icon: "policy",
    label: "Policy Updated",
    title: "Heuristic ruleset v2.4.1 deployed",
    body: "Adjusted threshold parameters for rapid sequential tx clustering. Expected to reduce false positives in high-frequency trading protocols by 14%.",
    href: "/policy",
  },
];

export const judgmentSteps = [
  {
    seq: "SEQ_01",
    title: "Policy Publication",
    body: "Rules are codified into smart contract parameters. This step is User-approved and AI-assisted, ensuring human intent is translated into deterministic logic accurately.",
    tone: "primary",
    align: "right" as const,
  },
  {
    seq: "SEQ_02",
    title: "Wallet Submission",
    body: "The claimant submits a wallet plus public HTTPS links. They may optionally sign a control statement that names the target and policy. The court stores that signature; it proves key control only, not identity.",
    tone: "secondary",
    align: "left" as const,
  },
  {
    seq: "SEQ_03",
    title: "Data Retrieval",
    body: "The contract fetches the submitted HTTPS pages and up to three public explorers for the chain named in the policy. Failed or thin pages stay labeled. Nothing is invented.",
    tone: "tertiary",
    align: "right" as const,
  },
  {
    seq: "SEQ_04",
    title: "The Verdict",
    body: "A designated Leader Validator processes the state snapshot and writes full, transparent reasoning, citing specific immutable evidence blocks for their decision.",
    tone: "error",
    align: "left" as const,
  },
  {
    seq: "SEQ_05",
    title: "Consensus",
    body: "Other validators independently review the reasoning and vote. Disagreement is shown honestly in the network state, ensuring transparent consensus mechanics.",
    tone: "primary",
    align: "right" as const,
  },
  {
    seq: "SEQ_06",
    title: "Appeal",
    body: "A Contested first verdict opens a 7-day appeal window. The appellant sends at least twice the submit bond as payable GEN. Eligible refunds both as credits and lists the wallet; Ineligible slashes the submitter and refunds the appellant; Contested refunds both. Studio may not pay credits out natively.",
    tone: "tertiary-container",
    align: "left" as const,
  },
];

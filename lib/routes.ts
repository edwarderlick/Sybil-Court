export const routes = {
  home: "/",
  howJudgments: "/how-judgments-work",
  connect: "/connect",
  policy: "/policy",
  submit: "/submit",
  cases: "/cases",
  case: (id: string) => `/cases/${id}`,
  appeal: (id: string) => `/cases/${id}/appeal`,
  passport: "/passport",
  leaderboard: "/leaderboard",
  dashboard: "/dashboard",
  activity: "/activity",
  activityEmpty: "/activity/empty",
} as const;

export const topNav = [
  { href: routes.policy, label: "Publish Policy" },
  { href: routes.submit, label: "Submit Wallet" },
  { href: routes.cases, label: "Browse Cases" },
  { href: routes.leaderboard, label: "Leaderboard" },
] as const;

export type SideNavKey =
  | "cases"
  | "disputes"
  | "governance"
  | "filter"
  | "state"
  | "settings"
  | "docs";

export const sideNav = [
  { href: routes.cases, label: "All Cases", icon: "gavel", key: "cases" as const },
  {
    href: `${routes.cases}?filter=open`,
    label: "Active Disputes",
    icon: "warning",
    key: "disputes" as const,
  },
  {
    href: routes.leaderboard,
    label: "Governance",
    icon: "account_balance",
    key: "governance" as const,
  },
  {
    href: routes.passport,
    label: "Project Filter",
    icon: "filter_list",
    key: "filter" as const,
  },
  {
    href: routes.activity,
    label: "System State",
    icon: "terminal",
    key: "state" as const,
  },
] as const;

export const sideNavFooter = [
  { href: routes.dashboard, label: "Settings", icon: "settings", key: "settings" as const },
  { href: routes.howJudgments, label: "Documentation", icon: "description", key: "docs" as const },
] as const;

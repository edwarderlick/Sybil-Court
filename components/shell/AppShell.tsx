import { type SideNavKey } from "@/lib/routes";
import { Footer } from "./Footer";
import { MobileDock } from "./MobileDock";
import { NetworkBanner } from "./NetworkBanner";
import { SideNav } from "./SideNav";
import { TopNav } from "./TopNav";

type AppShellProps = {
  children: React.ReactNode;
  variant?: "marketing" | "app";
  sidebar?: boolean;
  sidebarActive?: SideNavKey;
  footer?: boolean;
  dock?: boolean;
};

export function AppShell({
  children,
  variant = "app",
  sidebar = false,
  sidebarActive = "cases",
  footer = true,
  dock = false,
}: AppShellProps) {
  return (
    <div className="min-h-[100dvh] bg-background text-on-background font-body-md flex flex-col">
      <TopNav variant={variant} />
      <NetworkBanner />
      <div className="flex flex-1 relative">
        {sidebar ? <SideNav active={sidebarActive} /> : null}
        <div className={`flex-1 min-w-0 ${sidebar ? "md:ml-64" : ""}`}>
          {children}
          {footer ? <Footer inset={false} /> : null}
        </div>
      </div>
      {dock || sidebar ? <MobileDock /> : null}
    </div>
  );
}

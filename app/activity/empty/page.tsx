import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { Icon } from "@/components/ui/Icon";
import { routes } from "@/lib/routes";

export default function ActivityEmptyPage() {
  return (
    <AppShell sidebar sidebarActive="cases" footer={false} dock>
      <main className="min-h-[calc(100dvh-80px)] flex items-center justify-center p-margin_mobile md:p-margin_desktop grid-bg pb-20">
        <div className="max-w-2xl w-full border border-outline-variant bg-surface-container-low/80 backdrop-blur-sm p-8 md:p-12 isometric-shadow flex flex-col items-center text-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #cfbcff 25%, transparent 25%, transparent 75%, #cfbcff 75%, #cfbcff), repeating-linear-gradient(45deg, #cfbcff 25%, #141218 25%, #141218 75%, #cfbcff 75%, #cfbcff)",
              backgroundPosition: "0 0, 10px 10px",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 border border-outline-variant bg-surface flex items-center justify-center mb-8 rotate-45 isometric-shadow">
              <Icon
                name="sensors_off"
                className="text-4xl text-on-surface-variant -rotate-45"
              />
            </div>
            <h1 className="font-headline-xl text-[40px] md:text-[56px] text-on-surface mb-4 uppercase tracking-tighter">
              Quiet Right Now
            </h1>
            <p className="font-label-technical text-label-technical text-on-surface-variant max-w-md mx-auto mb-10 leading-relaxed">
              No recent protocol activity detected. System is monitoring for new
              policy publications and case submissions across Layer 02.
            </p>
            <Link
              href={routes.activity}
              className="group flex items-center gap-3 bg-transparent border border-primary text-primary px-8 py-4 font-label-technical text-label-technical uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all shadow-[0_0_15px_rgba(207,188,255,0.1)]"
            >
              <Icon name="sync" className="text-sm" />
              Refresh Terminal
            </Link>
            <div className="mt-12 flex items-center gap-2 font-label-technical text-label-technical text-outline">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              System Monitoring Active
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

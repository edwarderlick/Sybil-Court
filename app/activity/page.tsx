import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { Icon } from "@/components/ui/Icon";
import { activity } from "@/lib/content";
import { routes } from "@/lib/routes";

const tone = {
  error: "bg-error text-error",
  tertiary: "bg-tertiary text-tertiary",
  primary: "bg-primary text-primary",
};

export default function ActivityPage() {
  return (
    <AppShell sidebar sidebarActive="state" dock>
      <div className="tech-grid min-h-[calc(100dvh-80px)]">
        <div className="p-margin_mobile md:p-margin_desktop max-w-5xl mx-auto w-full pb-24">
          <header className="mb-12 flex justify-between items-end border-b border-outline-variant/50 pb-6">
            <div>
              <h1 className="font-headline-xl text-[40px] md:text-headline-xl text-on-surface mb-2 uppercase">
                Protocol Feed
              </h1>
              <p className="font-label-technical text-label-technical text-on-surface-variant">
                Real-time resolution layer activity
              </p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/30 px-3 py-1.5">
              <div className="relative w-2 h-2 flex items-center justify-center">
                <div className="absolute w-2 h-2 bg-primary rounded-full pulse-dot" />
                <div className="relative w-1.5 h-1.5 bg-primary rounded-full" />
              </div>
              <span className="font-label-technical text-label-technical text-primary uppercase tracking-widest">
                Live
              </span>
            </div>
          </header>
          <div className="space-y-grid_unit">
            {activity.map((item) => (
              <article
                key={item.id}
                className="bg-surface-container border border-outline-variant/30 p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:bg-surface-container-high transition-colors"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${tone[item.tone].split(" ")[0]}`} />
                <div className="flex-shrink-0 md:w-32 flex flex-col gap-1">
                  <span className="font-label-technical text-label-technical text-on-surface-variant">
                    {item.when}
                  </span>
                  <span className="font-label-technical text-label-technical text-on-surface opacity-50">
                    {item.id}
                  </span>
                </div>
                <div className="flex-grow flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon
                      name={item.icon}
                      className={`${tone[item.tone].split(" ")[1]} text-[18px]`}
                    />
                    <span
                      className={`font-label-technical text-label-technical uppercase ${tone[item.tone].split(" ")[1]}`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                    {item.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                    {item.body}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-start">
                  <Link
                    href={item.href}
                    className="border border-outline-variant text-on-surface hover:border-primary transition-colors p-2 flex items-center justify-center"
                  >
                    <Icon name="arrow_outward" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href={routes.activityEmpty}
              className="font-label-technical text-label-technical text-on-surface-variant hover:text-on-surface uppercase border border-outline-variant/50 px-6 py-2 bg-surface-container-lowest flex items-center gap-2"
            >
              <Icon name="refresh" className="text-[16px]" />
              Load More History
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

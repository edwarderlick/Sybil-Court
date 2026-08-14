import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { Icon } from "@/components/ui/Icon";
import { IsometricHero } from "@/components/visual/IsometricHero";
import { routes } from "@/lib/routes";

export default function LandingPage() {
  return (
    <AppShell variant="marketing" footer>
      <section className="relative min-h-[100dvh] pt-20 pb-20 px-margin_mobile md:px-margin_desktop grid-bg flex flex-col justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter relative z-10">
          <div className="lg:col-span-12 text-left mb-12">
            <h1 className="font-display-lg text-[48px] md:text-display-lg font-extrabold uppercase tracking-tighter text-on-background leading-none max-w-5xl mr-auto">
              Industrial Intelligence
              <br />
              Built For Critical Verdicts
            </h1>
          </div>
          <div className="lg:col-span-5 flex flex-col justify-end pb-12">
            <p className="font-body-md text-on-surface-variant mb-8 max-w-md text-left text-lg">
              Monitor operations, understand real-time sybil data, and receive
              AI-powered verdicts through one intelligent workspace built for
              critical operators.
            </p>
            <div className="flex justify-start gap-4">
              <Link
                href={routes.cases}
                className="bg-brand-orange text-white font-label-technical text-label-technical px-8 py-4 uppercase flex items-center gap-2 hover:bg-brand-orange/90 transition-colors"
              >
                Enter App
                <Icon name="arrow_outward" className="text-sm" />
              </Link>
            </div>
            <div className="mt-8 flex justify-start">
              <Link
                href={routes.howJudgments}
                className="font-label-technical text-label-technical text-primary hover:underline flex items-center gap-2 uppercase tracking-widest"
              >
                How Judgments Work
                <Icon name="chevron_right" className="text-[16px]" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7 relative w-full">
            <IsometricHero />
          </div>
        </div>
      </section>
      <section className="bg-brand-orange text-white py-section_gap px-margin_mobile md:px-margin_desktop relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 19px, #fff 19px, #fff 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #fff 19px, #fff 20px)",
          }}
        />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter relative z-10">
          <div className="lg:col-span-5 flex items-center">
            <h2 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl font-bold leading-tight">
              By bringing together fragmented sybil data across your ecosystem,
              it enables operators to access critical verdicts faster.
            </h2>
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-8 items-center mt-12 lg:mt-0">
            <div className="border-l border-white/30 pl-6">
              <div className="font-stat-value text-stat-value font-semibold mb-2">
                98.2%
              </div>
              <div className="font-label-technical text-label-technical uppercase tracking-widest opacity-80">
                Verdict Accuracy
              </div>
            </div>
            <div className="border-l border-white/30 pl-6">
              <div className="font-stat-value text-stat-value font-semibold mb-2">
                50+
              </div>
              <div className="font-label-technical text-label-technical uppercase tracking-widest opacity-80">
                Analysis Models
              </div>
            </div>
            <div className="border-l border-white/30 pl-6">
              <div className="font-stat-value text-stat-value font-semibold mb-2">
                60%
              </div>
              <div className="font-label-technical text-label-technical uppercase tracking-widest opacity-80">
                Resolution Speed
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

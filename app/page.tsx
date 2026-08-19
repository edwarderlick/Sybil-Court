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
              Publish a policy, submit a wallet with public evidence, and lock a
              payable GEN bond. Validators fetch those pages and store a full
              written verdict. Eligible returns a credit and lists the wallet.
              Ineligible slashes to the treasury. Contested opens a 7-day appeal.
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
          <div className="lg:col-span-12">
            <h2 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl font-bold leading-tight max-w-4xl">
              Policy, public evidence fetch, a full written verdict, then the
              bond moves. Eligible credits and lists the wallet. Ineligible
              slashes to the treasury. Contested opens a 7-day, 2× appeal.
              No invented accuracy scores.
            </h2>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

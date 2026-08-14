import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { Icon } from "@/components/ui/Icon";
import { judgmentSteps } from "@/lib/content";
import { routes } from "@/lib/routes";

const toneClass: Record<string, string> = {
  primary: "text-primary bg-primary/10",
  secondary: "text-secondary bg-secondary/10",
  tertiary: "text-tertiary bg-tertiary/10",
  error: "text-error bg-error/10",
  "tertiary-container": "text-tertiary-container bg-tertiary-container/10",
};

const dotClass: Record<string, string> = {
  primary: "bg-primary shadow-[0_0_10px_rgba(207,188,255,0.8)]",
  secondary: "bg-secondary shadow-[0_0_10px_rgba(205,192,233,0.8)]",
  tertiary: "bg-tertiary shadow-[0_0_10px_rgba(231,195,101,0.8)]",
  error: "bg-error shadow-[0_0_10px_rgba(255,180,171,0.8)]",
  "tertiary-container":
    "bg-tertiary-container shadow-[0_0_10px_rgba(201,167,77,0.8)]",
};

export default function HowJudgmentsWorkPage() {
  return (
    <AppShell variant="marketing">
      <div className="fixed inset-0 tech-grid-bg pointer-events-none z-0" />
      <main className="relative z-10 flex-grow flex flex-col w-full px-margin_mobile md:px-margin_desktop pb-section_gap pt-16">
        <header className="max-w-4xl mx-auto text-center mb-24">
          <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-3 py-1 text-primary font-label-technical text-label-technical mb-6 uppercase">
            <Icon name="gavel" className="text-sm" />
            Protocol Layer 02 Overview
          </div>
          <h1 className="font-display-lg text-headline-xl md:text-display-lg text-on-surface uppercase mb-6">
            How Judgments <span className="text-primary">Work</span>
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
            An industrial-grade resolution engine mapping off-chain realities to
            on-chain enforcement. Follow the deterministic sequence of truth
            verification.
          </p>
        </header>
        <section className="max-w-6xl mx-auto w-full relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-outline-variant hidden lg:block -translate-x-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-16 gap-x-24 relative">
            {judgmentSteps.map((step, index) => {
              const right = step.align === "right";
              return (
                <div key={step.seq} className="contents">
                  {right ? null : <div className="hidden lg:block" />}
                  {right ? null : index > 0 ? (
                    <div className="hidden lg:block" />
                  ) : null}
                  <div
                    className={`relative flex flex-col justify-center ${
                      right ? "lg:text-right lg:items-end" : ""
                    }`}
                  >
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-8 h-px bg-outline-variant hidden lg:block ${
                        right ? "right-[-48px]" : "left-[-48px]"
                      }`}
                    />
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full hidden lg:block ${
                        right ? "right-[-53px]" : "left-[-53px]"
                      } ${dotClass[step.tone]}`}
                    />
                    <div className="border border-outline-variant bg-surface-container-low p-6 w-full lg:w-4/5 iso-card relative overflow-hidden group">
                      <div className="flex items-center gap-3 mb-4 lg:justify-start">
                        {right ? (
                          <>
                            <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                              {step.title}
                            </h3>
                            <span
                              className={`font-label-technical text-label-technical px-2 py-1 ${toneClass[step.tone]}`}
                            >
                              {step.seq}
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className={`font-label-technical text-label-technical px-2 py-1 ${toneClass[step.tone]}`}
                            >
                              {step.seq}
                            </span>
                            <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                              {step.title}
                            </h3>
                          </>
                        )}
                      </div>
                      <p className="text-on-surface-variant font-body-md">
                        {step.body}
                      </p>
                    </div>
                  </div>
                  {right ? <div className="hidden lg:block" /> : null}
                </div>
              );
            })}
          </div>
        </section>
        <section className="mt-section_gap flex flex-col items-center justify-center text-center">
          <div className="p-12 border border-outline-variant bg-surface-container w-full max-w-4xl relative overflow-hidden flex flex-col items-center">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #cfbcff 0, #cfbcff 1px, transparent 1px, transparent 16px)",
              }}
            />
            <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase mb-4 relative z-10">
              Initialize Sequence
            </h2>
            <p className="text-on-surface-variant font-body-md mb-8 max-w-lg relative z-10">
              Ready to deploy robust resolution mechanics for your operations?
              Enter the application to begin.
            </p>
            <Link
              href={routes.cases}
              className="relative z-10 bg-primary text-on-primary font-label-technical text-label-technical px-8 py-4 uppercase tracking-widest font-bold hover:bg-primary-fixed shadow-[0_0_20px_rgba(207,188,255,0.3)] transition-all hover:scale-105 flex items-center gap-2"
            >
              Enter App
              <Icon name="arrow_outward" className="text-sm" />
            </Link>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <AppShell footer={false}>
      <main className="min-h-[calc(100dvh-80px)] grid-bg flex items-center justify-center p-margin_mobile">
        <div className="max-w-xl border border-outline-variant bg-surface-container-low p-10 text-center">
          <p className="font-label-technical text-label-technical text-primary uppercase mb-4">
            Docket Missing
          </p>
          <h1 className="font-headline-xl text-headline-lg md:text-headline-xl uppercase mb-4">
            Record Not Found
          </h1>
          <p className="text-on-surface-variant mb-8">
            This case or route is not in the current public docket.
          </p>
          <Link
            href={routes.cases}
            className="inline-flex bg-primary text-on-primary font-label-technical text-label-technical uppercase px-6 py-3"
          >
            Return to Case Log
          </Link>
        </div>
      </main>
    </AppShell>
  );
}

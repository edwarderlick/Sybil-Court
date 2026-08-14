"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCourt } from "@/components/providers/CourtProvider";
import { AppShell } from "@/components/shell/AppShell";
import { Icon } from "@/components/ui/Icon";
import { policyDraft } from "@/lib/content";
import { policyDraftText, titleFromPolicyText } from "@/lib/court";
import { routes } from "@/lib/routes";

type Mode = "suggested" | "edit" | "discarded" | "published";

export default function PublishPolicyPage() {
  const initial = useMemo(policyDraftText, []);
  const { publishPolicy, lastPolicyId, lastTxHash, pending, lastError, policies } =
    useCourt();
  const [mode, setMode] = useState<Mode>("suggested");
  const [text, setText] = useState("");
  const [modelLabel, setModelLabel] = useState("gemini-2.5-flash");
  const [recommending, setRecommending] = useState(false);
  const [requestHint, setRequestHint] = useState("");
  const [error, setError] = useState("");
  const hasDraft = text.trim().length > 0;

  const published = lastPolicyId
    ? policies.find((item) => item.id === lastPolicyId)
    : null;

  const requestRecommendation = async () => {
    setRecommending(true);
    setError("");
    try {
      const response = await fetch("/api/recommend-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hint: requestHint.trim() }),
      });
      const payload = (await response.json()) as {
        text?: string;
        model?: string;
        error?: string;
      };
      if (!response.ok || !payload.text?.trim()) {
        throw new Error(
          payload.error || `Recommendation failed (${response.status}).`,
        );
      }
      setText(payload.text.trim());
      setModelLabel(payload.model || "gemini-2.5-flash");
      setMode("suggested");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setRecommending(false);
    }
  };

  const storePolicy = async (source: "accepted" | "edited" | "original") => {
    const body = (source === "accepted" && !text.trim() ? initial : text).trim();
    if (!body) {
      setError("Policy text is required before it can be stored.");
      return;
    }
    try {
      await publishPolicy({
        body,
        source,
        title: titleFromPolicyText(body),
        project: policyDraft.project,
      });
      setText(body);
      setMode("published");
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  };

  return (
    <AppShell>
      <main className="flex-grow flex flex-col items-center justify-center p-gutter md:p-margin_desktop relative">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary rounded-full mix-blend-screen filter blur-[100px] animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>
        <div className="w-full max-w-5xl z-10 grid grid-cols-1 md:grid-cols-12 gap-gutter pb-16">
          <div className="col-span-1 md:col-span-12 mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-end border-b border-outline-variant pb-8">
            <div>
              <h1 className="font-headline-xl text-[36px] md:text-headline-xl text-on-background mb-4">
                Policy Intelligence
              </h1>
              <p className="font-body-md text-on-surface-variant max-w-2xl">
                {policyDraft.project}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-8 md:mt-0">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center font-label-technical text-label-technical text-on-surface-variant">
                  01
                </div>
                <div className="h-px w-8 bg-outline-variant" />
                <div className="w-8 h-8 rounded-full bg-primary border border-primary flex items-center justify-center font-label-technical text-label-technical text-on-primary ring-2 ring-primary/50 shadow-[0_0_15px_rgba(207,188,255,0.5)]">
                  02
                </div>
                <div className="h-px w-8 bg-outline-variant" />
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center font-label-technical text-label-technical ${
                    mode === "published"
                      ? "bg-primary border-primary text-on-primary"
                      : "bg-surface-container border-outline-variant text-on-surface-variant"
                  }`}
                >
                  03
                </div>
              </div>
              <span className="font-label-technical text-label-technical text-primary tracking-widest uppercase">
                {mode === "published" ? "Stored" : "AI Recommendation"}
              </span>
            </div>
          </div>
          <div className="col-span-1 md:col-span-8 policy-iso bg-surface-container-low border border-primary/30 p-8 relative overflow-hidden backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8 border-b border-outline/30 pb-4">
              <div className="flex items-center gap-3">
                <Icon name="memory" className="text-primary animate-spin" />
                <span className="font-label-technical text-label-technical text-primary uppercase tracking-widest">
                  Model: {modelLabel}
                </span>
              </div>
              <div className="bg-primary/10 border border-primary text-primary px-3 py-1 font-label-technical text-label-technical flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {mode === "published"
                  ? "Policy Stored"
                  : recommending
                    ? "Synthesizing"
                    : mode === "discarded"
                      ? "Draft Cleared"
                      : mode === "edit"
                        ? "Editing Draft"
                        : hasDraft
                          ? "Synthesis Complete"
                          : "Awaiting Recommendation"}
              </div>
            </div>
            {mode === "edit" || mode === "discarded" ? (
              <textarea
                className="w-full min-h-[360px] bg-surface-container-high border border-outline-variant p-4 font-body-md text-on-surface focus:outline-none focus:border-primary whitespace-pre-wrap"
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setError("");
                }}
                placeholder="Write the policy in full. The court stores the complete text."
              />
            ) : mode === "suggested" ? (
              hasDraft ? (
                <div className="font-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                  {text}
                </div>
              ) : (
                <div className="font-body-md text-on-surface-variant leading-relaxed">
                  <p className="mb-4">
                    No live recommendation yet. Request one to generate a full
                    policy draft with Gemini. Leave the request box empty for a
                    general Sybil Court policy, or type a specific need to tailor
                    it. Accept / Edit / Discard stay the same after the draft
                    arrives.
                  </p>
                  <p>
                    If the AI call fails, the real error will appear below
                    instead of a fake draft.
                  </p>
                </div>
              )
            ) : (
              <div className="font-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                {published?.body || text}
              </div>
            )}
            {mode === "published" && published ? (
              <p className="mt-6 font-label-technical text-label-technical text-primary">
                Stored as {published.id}. Full text is retained for later dockets.
              </p>
            ) : null}
            {lastTxHash ? (
              <p className="mt-2 font-label-technical text-label-technical text-on-surface-variant break-all">
                Tx {lastTxHash}
              </p>
            ) : null}
            {pending ? (
              <p className="mt-4 font-label-technical text-label-technical text-primary">
                {pending}
              </p>
            ) : null}
            {error || lastError ? (
              <p className="mt-4 font-label-technical text-label-technical text-error whitespace-pre-wrap break-all">
                {error || lastError}
              </p>
            ) : null}
          </div>
          <div className="col-span-1 md:col-span-4 flex flex-col gap-4">
            <div className="bg-surface-container border border-outline-variant p-6 mb-4">
              <h3 className="font-label-technical text-label-technical text-on-surface-variant uppercase mb-3 tracking-widest border-b border-outline-variant pb-2">
                Recommendation request
              </h3>
              <textarea
                className="w-full min-h-[88px] bg-surface-container-high border border-outline-variant p-3 font-body-md text-on-surface focus:outline-none focus:border-primary mb-2"
                value={requestHint}
                onChange={(event) => setRequestHint(event.target.value)}
                placeholder="Optional. Empty = general Sybil Court policy. Example: Base airdrop sybil checker for wallets."
                maxLength={800}
                disabled={recommending || Boolean(pending)}
              />
              <p className="font-label-technical text-[11px] text-on-surface-variant">
                {requestHint.trim()
                  ? "Gemini will tailor the draft to this request."
                  : "Gemini will write a general eligibility policy."}
              </p>
            </div>
            <div className="bg-surface-container border border-outline-variant p-6 mb-4">
              <h3 className="font-label-technical text-label-technical text-on-surface-variant uppercase mb-4 tracking-widest border-b border-outline-variant pb-2">
                Confidence Matrix
              </h3>
              <div className="space-y-4">
                {policyDraft.confidence.map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between font-label-technical text-label-technical text-on-surface mb-1">
                      <span>{row.label}</span>
                      <span>{row.value}</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-highest flex">
                      <div
                        className={`h-full ${row.tone === "tertiary" ? "bg-tertiary" : "bg-primary"}`}
                        style={{ width: row.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {mode === "published" ? (
              <Link
                href={routes.submit}
                className="w-full bg-primary text-on-primary font-headline-lg-mobile px-6 py-6 border border-primary hover:bg-primary-fixed hover:shadow-[0_0_20px_rgba(207,188,255,0.4)] transition-all flex justify-between items-center group"
              >
                <span>Submit Wallet</span>
                <Icon
                  name="arrow_outward"
                  className="text-[32px] group-hover:translate-x-2 transition-transform"
                />
              </Link>
            ) : !hasDraft && mode === "suggested" ? (
              <button
                type="button"
                disabled={recommending || Boolean(pending)}
                onClick={() => void requestRecommendation()}
                className="w-full bg-primary text-on-primary font-headline-lg-mobile px-6 py-6 border border-primary hover:bg-primary-fixed hover:shadow-[0_0_20px_rgba(207,188,255,0.4)] transition-all flex justify-between items-center group disabled:opacity-60"
              >
                <span>
                  {recommending ? "Requesting draft…" : "Request Recommendation"}
                </span>
                <Icon
                  name="memory"
                  className={`text-[32px] ${recommending ? "animate-spin" : ""}`}
                />
              </button>
            ) : (
              <button
                type="button"
                disabled={Boolean(pending) || recommending}
                onClick={() =>
                  storePolicy(
                    mode === "discarded"
                      ? "original"
                      : mode === "edit"
                        ? "edited"
                        : "accepted",
                  )
                }
                className="w-full bg-primary text-on-primary font-headline-lg-mobile px-6 py-6 border border-primary hover:bg-primary-fixed hover:shadow-[0_0_20px_rgba(207,188,255,0.4)] transition-all flex justify-between items-center group disabled:opacity-60"
              >
                <span>
                  {pending
                    ? pending
                    : mode === "suggested"
                      ? "Accept Policy"
                      : "Store Policy"}
                </span>
                <Icon
                  name="check_circle"
                  className="text-[32px] group-hover:translate-x-2 transition-transform"
                />
              </button>
            )}
            {hasDraft && mode !== "published" ? (
              <button
                type="button"
                disabled={recommending || Boolean(pending)}
                onClick={() => void requestRecommendation()}
                className="w-full bg-surface-container border border-outline-variant text-on-surface font-label-technical text-label-technical px-6 py-3 uppercase tracking-widest hover:bg-surface-container-high transition-all disabled:opacity-60"
              >
                {recommending ? "Requesting draft…" : "Regenerate Recommendation"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setMode("edit");
                setText((current) => published?.body || current || "");
                setError("");
              }}
              className="w-full bg-surface-container border border-outline text-on-surface font-headline-lg-mobile px-6 py-4 hover:bg-surface-container-high transition-all flex justify-between items-center"
            >
              <span>Edit Draft</span>
              <Icon name="edit_note" className="text-[24px]" />
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("discarded");
                setText("");
                setError("");
              }}
              className="w-full bg-transparent border border-error/50 text-error font-label-technical text-label-technical px-6 py-4 hover:bg-error-container/20 transition-all flex justify-between items-center uppercase tracking-widest mt-auto"
            >
              <span>Discard & Write My Own</span>
              <Icon name="delete" className="text-[16px]" />
            </button>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = "gemini-2.5-flash";

function extractText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  const candidates = record.candidates;
  if (Array.isArray(candidates) && candidates[0] && typeof candidates[0] === "object") {
    const content = (candidates[0] as Record<string, unknown>).content;
    if (content && typeof content === "object") {
      const parts = (content as Record<string, unknown>).parts;
      if (Array.isArray(parts)) {
        const chunks = parts
          .map((part) =>
            part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string"
              ? String((part as Record<string, unknown>).text)
              : "",
          )
          .filter(Boolean);
        return chunks.join("\n").trim();
      }
    }
  }
  return "";
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not configured on the server. Add it in Vercel project settings (Production) and in .env.local, then redeploy.",
      },
      { status: 503 },
    );
  }

  let hint = "";
  try {
    const body = (await request.json()) as { hint?: unknown };
    if (typeof body.hint === "string") hint = body.hint.trim().slice(0, 800);
  } catch {
    hint = "";
  }

  const tailored = hint.length > 0;
  const prompt = tailored
    ? [
        "Write a complete Sybil Court eligibility policy tailored to this operator request.",
        "Operator request (you must follow this; do not ignore it or substitute a generic template):",
        hint,
        "The title and the numbered clauses must clearly address that request (chain, airdrop, product, or check they named).",
        "Still include: uniqueness / non-sybil test, public evidence requirements, Contested when sources fail or are thin, Ineligible when farming/clusters are clearly shown, and a ban on inventing transactions or balances.",
        "First line is the policy title. Plain text only. No markdown fences. No JSON.",
      ].join("\n")
    : [
        "Write a complete general Sybil Court eligibility policy for default use.",
        "This is the default court policy: decide whether a submitted wallet is a unique human operator versus a sybil, using only fetched public web pages.",
        "Do not specialize it to one chain, one airdrop, or one product.",
        "First line is the policy title.",
        "Then 4–7 numbered clauses covering: uniqueness / non-sybil test, public evidence requirements, when to mark Contested if sources fail or are thin, when to mark Ineligible if farming/clusters are clearly shown, and a ban on inventing transactions or balances.",
        "Plain text only. No markdown fences. No JSON.",
      ].join(" ");

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    MODEL +
    ":generateContent?key=" +
    encodeURIComponent(apiKey);

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "You draft honest Sybil Court policies. Do not invent on-chain facts. The policy must tell judges to stay grounded in fetched public pages.",
            },
          ],
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4 },
      }),
    });

    const raw = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: `Gemini request failed (${upstream.status}): ${raw.slice(0, 600)}`,
        },
        { status: 502 },
      );
    }

    let parsed: unknown = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Gemini returned a non-JSON body." },
        { status: 502 },
      );
    }

    const text = extractText(parsed);
    if (!text) {
      return NextResponse.json(
        { error: "Gemini returned an empty policy draft." },
        { status: 502 },
      );
    }

    return NextResponse.json({ text, model: MODEL });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Policy recommendation failed: ${message}` },
      { status: 502 },
    );
  }
}

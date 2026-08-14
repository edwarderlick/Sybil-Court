import { NextResponse } from "next/server";

const UPSTREAM =
  process.env.GENLAYER_RPC ??
  process.env.NEXT_PUBLIC_GENLAYER_RPC ??
  "https://studio.genlayer.com/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!body.trim()) {
    return NextResponse.json({ error: "Empty JSON-RPC body" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55_000);
    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Studio RPC proxy failed: ${message}` },
      { status: 502 },
    );
  }
}

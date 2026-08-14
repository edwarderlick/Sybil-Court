"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/format";

export function useCountdown(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    setRemaining(initialSeconds);
    const id = window.setInterval(() => {
      setRemaining((value) => (value <= 0 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [initialSeconds]);

  return remaining;
}

export function Countdown({
  initialSeconds,
  className = "",
}: {
  initialSeconds: number;
  className?: string;
}) {
  const remaining = useCountdown(initialSeconds);
  return <span className={className}>{formatCountdown(remaining)}</span>;
}

export function CountdownBar({
  initialSeconds,
  segments = 5,
  tone = "primary",
}: {
  initialSeconds: number;
  segments?: number;
  tone?: "primary" | "error" | "tertiary";
}) {
  const remaining = useCountdown(initialSeconds);
  const filled = Math.max(
    1,
    Math.ceil((remaining / Math.max(initialSeconds, 1)) * segments),
  );
  const on =
    tone === "error"
      ? "bg-error/80 border border-error"
      : tone === "tertiary"
        ? "bg-tertiary/80 border border-tertiary"
        : "bg-primary border border-primary/40";

  return (
    <div className="w-full flex gap-1 h-2">
      {Array.from({ length: segments }).map((_, index) => (
        <div
          key={index}
          className={`flex-1 ${
            index < filled
              ? on
              : "bg-surface-container-high border border-outline-variant/30"
          }`}
        />
      ))}
    </div>
  );
}

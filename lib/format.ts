export function shortenAddress(address: string, left = 4, right = 4) {
  if (address.length <= left + right + 2) return address;
  return `${address.slice(0, left + 2)}...${address.slice(-right)}`;
}

export function formatCountdown(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds);
  const h = Math.floor(clamped / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((clamped % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (clamped % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

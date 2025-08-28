export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function pct(a: number, b: number) {
  if (b === 0) return 0;
  return Math.round((a / b) * 100);
}

export function rand(min: number, max: number) {
  return Math.floor(Math.random()*(max-min+1)) + min;
}

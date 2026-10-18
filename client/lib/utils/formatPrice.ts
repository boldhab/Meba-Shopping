export function formatPrice(value: number | string, currency: string = "ETB"): string {
  const num = typeof value === "string" ? parseFloat(value) || 0 : value;
  if (currency.toUpperCase() === "ETB") {
    return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(num);
}

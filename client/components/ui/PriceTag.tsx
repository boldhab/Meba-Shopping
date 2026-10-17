export function PriceTag({ value = 0 }: { value?: number }) {
  return <span>${value.toFixed(2)}</span>;
}

export function calculateDiscount(amount: number, discountPercentage: number) {
  return amount - amount * (discountPercentage / 100);
}

export function calculateCarbonEmissions(
  amount: number,
  factor: number
): number {
  return Math.round(amount * factor * 100) / 100
}

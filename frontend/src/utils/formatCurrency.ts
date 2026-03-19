/**
 * Format a number as Indian Rupee (INR).
 * Uses Intl.NumberFormat for correct grouping (1,00,000 format).
 *
 * @example
 * formatINR(1050)    → "₹1,050.00"
 * formatINR(107, 0)  → "₹107"
 */
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const inrFormatterNoDecimal = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatINR(amount: number, decimals: 0 | 2 = 2): string {
  return decimals === 0
    ? inrFormatterNoDecimal.format(amount)
    : inrFormatter.format(amount);
}

/**
 * Parse an INR string back to a number.
 * Strips ₹ and comma separators.
 */
export function parseINR(value: string): number {
  return parseFloat(value.replace(/[₹,\s]/g, '')) || 0;
}

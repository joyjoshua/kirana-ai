/**
 * Builds a UPI deep-link URL for payment.
 * Format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
 *
 * @see https://www.npci.org.in/what-we-do/upi/upi-qr-code
 */
export function buildUpiDeepLink(options: {
  vpa: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
}): string {
  const params = new URLSearchParams({
    pa: options.vpa,
    pn: options.payeeName,
    am: options.amount.toFixed(2),
    cu: 'INR',
    tn: options.transactionNote,
  });

  return `upi://pay?${params.toString()}`;
}

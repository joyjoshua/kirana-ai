interface UpiParams {
  vpa: string;       // Merchant UPI VPA e.g. "ramesh@upi"
  name: string;      // Merchant display name
  amount: number;    // Payment amount in INR
  saleId: string;    // Reference ID
}

/**
 * Build a UPI deep-link for QR code generation.
 * Format: upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}
 */
export function buildUpiLink({ vpa, name, amount, saleId }: UpiParams): string {
  const params = new URLSearchParams({
    pa: vpa,
    pn: name,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: `KiranaAI Sale #${saleId}`,
  });
  return `upi://pay?${params.toString()}`;
}

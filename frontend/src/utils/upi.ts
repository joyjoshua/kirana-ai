interface UpiParams {
  vpa: string;
  name: string;
  amount: number;
  saleId: string;
}

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

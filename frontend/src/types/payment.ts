export interface QrData {
  upi_link: string;
  amount: number;
  merchant_vpa: string;
  merchant_name: string;
  sale_id: string;
}

export type PaymentStatus = 'idle' | 'waiting' | 'paid' | 'failed';

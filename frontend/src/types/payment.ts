export interface QrData {
  qr_data_url: string;
  upi_link: string;
}

export type PaymentStatus = 'idle' | 'waiting' | 'paid' | 'failed';

import QRCode from 'qrcode';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { buildUpiDeepLink } from '../utils/upi';
import { NotFoundError } from '../middleware/error-handler';

export interface QrResult {
  qr_data_url: string;  // Base64 PNG data URL
  upi_link: string;
}

/**
 * Generates a UPI QR code for a given sale.
 *
 * 1. Fetches the store's UPI VPA from Supabase
 * 2. Builds a UPI deep-link URL
 * 3. Generates a QR code as a base64 data URL (PNG)
 *
 * @param amount  - Payment amount in INR
 * @param storeId - UUID of the store (to fetch UPI VPA)
 * @param saleId  - UUID of the sale (for transaction note)
 */
export async function generateUpiQr(
  amount: number,
  storeId: string,
  saleId: string
): Promise<QrResult> {
  // 1. Fetch store UPI VPA
  const { data: store, error } = await supabase
    .from('stores')
    .select('upi_vpa, store_name')
    .eq('id', storeId)
    .single();

  if (error || !store) {
    throw new NotFoundError('Store', storeId);
  }

  // 2. Build UPI deep-link
  const upiLink = buildUpiDeepLink({
    vpa: store.upi_vpa,
    payeeName: store.store_name,
    amount,
    transactionNote: `KiranaAI Sale #${saleId.slice(0, 8)}`,
  });

  // 3. Generate QR as base64 data URL
  const qrDataUrl = await QRCode.toDataURL(upiLink, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });

  logger.info(
    { saleId, amount, vpa: store.upi_vpa },
    'UPI QR generated'
  );

  return { qr_data_url: qrDataUrl, upi_link: upiLink };
}

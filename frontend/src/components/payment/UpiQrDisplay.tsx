import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { buildUpiLink } from '@/utils/upi';
import { formatCurrency } from '@/utils/formatCurrency';
import { confirmPayment } from '@/api/sales';
import { showToast } from '../shared/Toast';

interface UpiQrDisplayProps {
  amount: number;
  merchantVpa: string;
  merchantName: string;
  saleId: string;
  onPaymentConfirmed: () => void;
}

export function UpiQrDisplay({ amount, merchantVpa, merchantName, saleId, onPaymentConfirmed }: UpiQrDisplayProps) {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  const upiLink = buildUpiLink({ vpa: merchantVpa, name: merchantName, amount, saleId });

  const handleMarkAsPaid = async () => {
    setLoading(true);
    try {
      await confirmPayment(saleId);
      setPaid(true);
      setTimeout(() => onPaymentConfirmed(), 1800);
    } catch {
      showToast('Could not confirm payment. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
    >
      <Card>
        {/* Cyan header */}
        <div
          className="flex items-center justify-center rounded-t-[20px]"
          style={{ backgroundColor: '#00BAF2', height: 52, margin: '-24px -24px 20px -24px' }}
        >
          <span className="text-[17px] font-semibold text-white tracking-[-0.43px]">Scan to Pay</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <AnimatePresence mode="wait">
            {paid ? (
              <motion.div
                key="success"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
                className="flex flex-col items-center gap-3 py-8"
              >
                <CheckCircle size={64} color="#00C48C" strokeWidth={1.5} />
                <p className="text-[22px] font-bold text-[#00C48C] tracking-[-0.26px]">Payment Received!</p>
                <p className="text-[17px] text-[#8E8E93]">{formatCurrency(amount)}</p>
              </motion.div>
            ) : (
              <motion.div key="qr" className="flex flex-col items-center gap-3">
                <div className="rounded-[12px] p-3 bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <QRCodeSVG value={upiLink} size={200} level="M" bgColor="#FFFFFF" fgColor="#000000" />
                </div>
                <p className="text-[36px] font-bold text-[#1C1C1E] tracking-[-0.5px]">{formatCurrency(amount)}</p>
                <p className="text-[15px] text-[#8E8E93] tracking-[-0.23px]">{merchantName}</p>
                <div className="flex items-center gap-1.5 text-[13px] text-[#8E8E93]">
                  <Clock size={14} />
                  <span>Waiting for payment</span>
                  <span className="animate-pulse">…</span>
                </div>
                <Button
                  variant="upi"
                  className="w-full mt-1"
                  loading={loading}
                  onClick={handleMarkAsPaid}
                >
                  Mark as Paid ✓
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

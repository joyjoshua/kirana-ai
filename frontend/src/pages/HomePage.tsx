import { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, PageContainer } from '@/components/shared/Layout';
import { MicButton } from '@/components/voice/MicButton';
import { Waveform } from '@/components/voice/Waveform';
import { TranscriptDisplay } from '@/components/voice/TranscriptDisplay';
import { SaleConfirmationCard } from '@/components/sale/SaleConfirmationCard';
import { UpiQrDisplay } from '@/components/payment/UpiQrDisplay';
import { WhatsAppBubble } from '@/components/reorder/WhatsAppBubble';
import { StockAlert } from '@/components/inventory/StockAlert';
import { Card } from '@/components/ui/Card';
import { useVoiceState } from '@/hooks/useVoiceState';
import { useVapi } from '@/hooks/useVapi';
import { useSaleStore } from '@/stores/saleStore';
import { useAuthStore } from '@/stores/authStore';
import { parseSale } from '@/api/sales';
import { commitSale } from '@/api/sales';
import { createReorderDraft } from '@/api/reorder';
import { showToast } from '@/components/shared/Toast';
import type { SaleItem } from '@/types/sale';

// Store VPA is fetched from settings; fallback to env or placeholder
const MERCHANT_VPA = 'rameshstore@upi';
const MERCHANT_NAME = 'Ramesh Store';

export default function HomePage() {
  const { state, transcript, errorMessage, send } = useVoiceState();
  const { storeId } = useAuthStore();
  const {
    items, saleId, totalAmount, reorderItems,
    setItems, updateItem, removeItem,
    setSaleId, setTotalAmount, setLowStockItems,
    setReorderDraft, setPaymentStatus, reset,
  } = useSaleStore();

  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  // --- VAPI Integration ---
  const { startCall, stopCall } = useVapi({
    onTranscript: useCallback((text: string, isFinal: boolean) => {
      send({ type: 'TRANSCRIPT_RECEIVED', transcript: text });
      if (isFinal) {
        // Final transcript triggers parse
      }
    }, [send]),

    onCallEnd: useCallback(() => {
      send({ type: 'SPEECH_ENDED' });
    }, [send]),

    onError: useCallback((_err: Error) => {
      send({ type: 'PARSE_ERROR', error: 'Voice service error. Please try again.' });
    }, [send]),
  });

  // --- Parse sale when speech ends ---
  useEffect(() => {
    if (state !== 'processing') return;
    // Check if we're processing from SPEECH_ENDED (voice) vs USER_CONFIRMED
    if (transcriptRef.current && !saleId) {
      void (async () => {
        try {
          const result = await parseSale(transcriptRef.current, storeId ?? '');
          if (result.items.length === 0) {
            send({ type: 'PARSE_ERROR', error: 'Could not understand the sale. Please try again.' });
            return;
          }
          setItems(result.items);
          send({ type: 'PARSE_SUCCESS', items: result.items });
        } catch {
          send({ type: 'PARSE_ERROR', error: 'Could not connect to AI. Check your network.' });
        }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // --- Commit sale after USER_CONFIRMED ---
  const handleConfirm = useCallback(async () => {
    if (!storeId) {
      showToast('Store not configured. Please complete onboarding.', 'error');
      return;
    }

    send({ type: 'USER_CONFIRMED' });
    try {
      const committedItems = items
        .filter((i) => i.sku_id !== null)
        .map((i) => ({ sku_id: i.sku_id!, qty: i.qty, unit_price: i.price }));

      const result = await commitSale(storeId, committedItems);
      setSaleId(result.saleId);
      setTotalAmount(result.totalAmount);
      setLowStockItems(result.lowStockItems);
      send({ type: 'SALE_COMMITTED', saleId: result.saleId });

      // Fetch reorder drafts for low stock items
      for (const lowItem of result.lowStockItems) {
        setReorderDraft(lowItem.sku_id, null, true);
        void createReorderDraft(lowItem.sku_id, storeId)
          .then((draft) => setReorderDraft(lowItem.sku_id, draft, false))
          .catch(() => setReorderDraft(lowItem.sku_id, null, false));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error && err.message.includes('stock')
        ? 'Not enough stock for one or more items.'
        : 'Could not save sale. Try again.';
      showToast(msg, 'error');
      send({ type: 'PARSE_ERROR', error: msg });
    }
  }, [storeId, items, send, setSaleId, setTotalAmount, setLowStockItems, setReorderDraft]);

  // --- Mic button press handler ---
  const handleMicPress = useCallback(async () => {
    if (state === 'idle' || state === 'error') {
      try {
        await startCall();
        send({ type: 'MIC_PRESSED' });
      } catch (_err: unknown) {
        // VAPI not configured — simulate with manual transcript for demo
        send({ type: 'MIC_PRESSED' });
        showToast('Voice not configured — type your sale below', 'info');
      }
    } else if (state === 'listening') {
      stopCall();
      send({ type: 'MIC_PRESSED' });
    }
  }, [state, startCall, stopCall, send]);

  const handleReset = useCallback(() => {
    reset();
    send({ type: 'RESET' });
    setPaymentStatus('idle');
  }, [reset, send, setPaymentStatus]);

  const showVoiceUI = state === 'idle' || state === 'listening' || state === 'error';
  const showConfirmation = state === 'confirmation' || state === 'processing';
  const showQr = state === 'committed' && saleId;

  return (
    <Layout title="KiranaAI">
      <PageContainer>
        {/* Voice UI area */}
        <AnimatePresence mode="wait">
          {showVoiceUI && (
            <motion.div
              key="voice-ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <TranscriptDisplay transcript={transcript} />
              <Waveform active={state === 'listening'} />

              {state === 'error' && (
                <Card>
                  <p className="text-[15px] text-[#E53935] text-center">{errorMessage}</p>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation card */}
        <AnimatePresence>
          {showConfirmation && items.length > 0 && (
            <SaleConfirmationCard
              key="confirmation"
              items={items}
              loading={state === 'processing'}
              onConfirm={handleConfirm}
              onEdit={(index: number, item: SaleItem) => updateItem(index, item)}
              onRemove={(index: number) => removeItem(index)}
              onReRecord={() => send({ type: 'USER_CORRECTED' })}
            />
          )}
        </AnimatePresence>

        {/* Low stock alerts */}
        <AnimatePresence>
          {state === 'committed' && reorderItems.length > 0 && (
            <motion.div
              key="reorder"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-[0.07px] mb-3">
                  Low Stock
                </p>
                {reorderItems.map((r) => {
                  const stockItem = useSaleStore.getState().lowStockItems.find((l) => l.sku_id === r.skuId);
                  if (!stockItem) return null;
                  if (r.loading) {
                    return (
                      <StockAlert
                        key={r.skuId}
                        item={stockItem}
                        onReorder={() => {}}
                        loading={true}
                      />
                    );
                  }
                  if (r.draft) {
                    return (
                      <WhatsAppBubble
                        key={r.skuId}
                        message={r.draft.message}
                        vendorName={r.draft.vendor_name}
                        vendorPhone={r.draft.vendor_phone}
                        itemName={r.name}
                      />
                    );
                  }
                  return (
                    <StockAlert
                      key={r.skuId}
                      item={stockItem}
                      onReorder={() => {
                        if (storeId) {
                          setReorderDraft(r.skuId, null, true);
                          void createReorderDraft(r.skuId, storeId)
                            .then((draft) => setReorderDraft(r.skuId, draft, false))
                            .catch(() => setReorderDraft(r.skuId, null, false));
                        }
                      }}
                    />
                  );
                })}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UPI QR */}
        {showQr && (
          <UpiQrDisplay
            amount={totalAmount}
            merchantVpa={MERCHANT_VPA}
            merchantName={MERCHANT_NAME}
            saleId={saleId}
            onPaymentConfirmed={handleReset}
          />
        )}

        {/* Spacer for FAB */}
        <div style={{ height: 100 }} />
      </PageContainer>

      {/* Floating Mic Button */}
      <div className="fixed bottom-[65px] left-0 right-0 flex justify-center z-40 max-w-[480px] mx-auto pointer-events-none">
        <div className="pointer-events-auto">
          <MicButton
            state={state}
            onPress={handleMicPress}
          />
        </div>
      </div>
    </Layout>
  );
}

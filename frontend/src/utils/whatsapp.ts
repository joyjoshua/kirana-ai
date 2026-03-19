/**
 * Build a wa.me deep-link for WhatsApp message pre-fill.
 * Opens WhatsApp with the given phone number and pre-filled text.
 *
 * @param phone  E.164 format without '+', e.g. "919876543210"
 * @param text   Message to pre-fill
 */
export function buildWhatsAppLink(phone: string, text: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
}

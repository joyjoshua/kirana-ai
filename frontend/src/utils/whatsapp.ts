export function buildWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export function stripVariantName(nameEn: string): string {
  return String(nameEn ?? '')
    .replace(/\s*[（(].*?[）)]\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}








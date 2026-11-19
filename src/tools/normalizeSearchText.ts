export default function normalizeSearchText(text: string) {
  // Keep the same offsets so matches can highlight the original title.
  return text.replaceAll('ё', 'е').replaceAll('Ё', 'Е').replaceAll('й', 'и').replaceAll('Й', 'И');
}

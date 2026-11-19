const upperBytes = Uint8Array.from({length: 128}, (_, index) => index + 128);
const encodings = new Map(
  Array.from(new TextDecoder('windows-1251').decode(upperBytes), (character, index) => [
    character,
    '%' + upperBytes[index].toString(16).toUpperCase(),
  ]),
);
encodings.delete('\uFFFD');

export default function encodeCp1251(text: string) {
  return Array.from(
    text,
    (character) => encodings.get(character) ?? encodeURIComponent(character),
  ).join('');
}

export default function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return new Uint8Array(buffer).toBase64();
}

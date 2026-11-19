export default function base64ToArrayBuffer(base64: string): ArrayBuffer {
  return Uint8Array.fromBase64(base64).buffer;
}

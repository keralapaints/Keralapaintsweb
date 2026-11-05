/**
 * The frame pack layout (scripts/encode-frames.ts): the magic `KPF1`, the header's byte length (uint32, little
 * endian), the JSON header, then each frame's bytes back to back in the order and sizes the header lists.
 */
export type FilmHeader = { fps: number; width: number; height: number; crop: { x: number; w: number }; type: string; sizes: number[] };

const MAGIC = "KPF1";

/**
 * Reads the header from the first `received` bytes of a pack once it is complete: the header and the offset of the
 * first frame, or undefined while bytes are still missing. Throws if the bytes are not a frame pack.
 */
export function readHeader(buffer: Uint8Array<ArrayBuffer>, received: number, url: string): { header: FilmHeader; end: number } | undefined {
  if (received < 8) return undefined;
  const view = new DataView(buffer.buffer, buffer.byteOffset);
  if (String.fromCharCode(...buffer.subarray(0, 4)) !== MAGIC) throw new Error(`${url} is not a frame pack`);
  const length = view.getUint32(4, true);
  if (received < 8 + length) return undefined;
  return { header: JSON.parse(new TextDecoder().decode(buffer.subarray(8, 8 + length))) as FilmHeader, end: 8 + length };
}

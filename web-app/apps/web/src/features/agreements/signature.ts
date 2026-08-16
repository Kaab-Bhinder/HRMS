/**
 * Turns a photograph of a signature on paper into a transparent PNG of just
 * the ink — the browser counterpart of the mobile capture screen, using the
 * same relative threshold so both produce a comparable result.
 *
 * Runs in the browser rather than on the server so the signer can inspect the
 * cleaned signature and retake it before committing. A signature nobody can
 * check is one nobody can vouch for.
 */

/** Ink is anything darker than this fraction of the page's own brightness. */
const INK_RATIO = 0.75;

/** Fewer ink pixels than this means a blank page or a badly framed shot. */
const MIN_INK_PIXELS = 200;

export async function extractSignature(file: Blob): Promise<string | null> {
  const bitmap = await createImageBitmap(file);

  // Cap the working size: a 12MP phone photo costs seconds to scan and adds
  // nothing, since the result is stamped at ~180pt wide.
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const img = ctx.getImageData(0, 0, w, h);
  const px = img.data;

  // Pass one: the paper's average brightness, so the threshold adapts to the
  // room instead of assuming a white page under good light.
  let total = 0;
  for (let i = 0; i < px.length; i += 4) {
    total += (px[i] * 299 + px[i + 1] * 587 + px[i + 2] * 114) / 1000;
  }
  const cutoff = (total / (px.length / 4)) * INK_RATIO;

  // Pass two: keep ink, drop the rest, and track the bounds for cropping.
  let ink = 0;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      const lum = (px[o] * 299 + px[o + 1] * 587 + px[o + 2] * 114) / 1000;
      if (lum < cutoff) {
        // Solid near-black: anti-aliasing the edge reintroduces a grey halo of
        // the paper it was supposed to remove.
        px[o] = 17; px[o + 1] = 17; px[o + 2] = 17; px[o + 3] = 255;
        ink++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      } else {
        px[o + 3] = 0;
      }
    }
  }
  if (ink < MIN_INK_PIXELS || maxX < 0) return null;

  ctx.putImageData(img, 0, 0);

  // Crop to the ink with a little margin, so the signature is not a small mark
  // adrift in a page of empty space.
  const pad = 8;
  const cx = Math.max(0, minX - pad);
  const cy = Math.max(0, minY - pad);
  const cw = Math.min(w, maxX + pad) - cx + 1;
  const ch = Math.min(h, maxY + pad) - cy + 1;

  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  out.getContext('2d')?.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
  return out.toDataURL('image/png');
}

/** Renders a finger/mouse-drawn path as the same transparent PNG. */
export function strokesToPng(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = img.data;
  let ink = 0, minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (px[(y * canvas.width + x) * 4 + 3] > 8) {
        ink++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (ink < 50 || maxX < 0) return null;
  const pad = 8;
  const cx = Math.max(0, minX - pad), cy = Math.max(0, minY - pad);
  const cw = Math.min(canvas.width, maxX + pad) - cx + 1;
  const ch = Math.min(canvas.height, maxY + pad) - cy + 1;
  const out = document.createElement('canvas');
  out.width = cw; out.height = ch;
  out.getContext('2d')?.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
  return out.toDataURL('image/png');
}

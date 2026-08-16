import 'dart:async';
import 'dart:typed_data';
import 'dart:ui' as ui;

/// Turns a photograph of a signature on paper into a transparent PNG of just
/// the ink.
///
/// Done on the device rather than the server so the signer sees the cleaned
/// result and can retake it before committing — a signature they cannot inspect
/// is one they cannot vouch for. Uses `dart:ui` only, so there is no native
/// image dependency to keep building on both platforms.
class SignatureProcessor {
  /// Pixels darker than this fraction of the page's own brightness are treated
  /// as ink. Relative rather than absolute because phone cameras expose paper
  /// anywhere from bright white to dim grey depending on the room.
  static const double _inkRatio = 0.75;

  /// Below this many ink pixels the capture is almost certainly a blank page or
  /// a badly framed shot, and stamping it into a contract would be worse than
  /// refusing it.
  static const int _minInkPixels = 200;

  /// Returns a transparent PNG, or null when the photo holds no usable ink.
  static Future<Uint8List?> extractSignature(Uint8List photoBytes) async {
    final ui.Image decoded = await _decode(photoBytes);
    final ByteData? raw = await decoded.toByteData(format: ui.ImageByteFormat.rawRgba);
    decoded.dispose();
    if (raw == null) return null;

    final Uint8List src = raw.buffer.asUint8List();
    final int width = decoded.width;
    final int height = decoded.height;

    // Pass one: find how bright the paper is, so the threshold adapts to the
    // lighting instead of assuming a white page.
    int total = 0;
    final int pixels = width * height;
    for (int i = 0; i < pixels; i++) {
      final int o = i * 4;
      total += (src[o] * 299 + src[o + 1] * 587 + src[o + 2] * 114) ~/ 1000;
    }
    final double mean = total / pixels;
    final double cutoff = mean * _inkRatio;

    // Pass two: keep the ink, drop everything else, and note the ink's bounds
    // so the result can be cropped to the signature itself.
    final Uint8List out = Uint8List(pixels * 4);
    int inkCount = 0;
    int minX = width, minY = height, maxX = -1, maxY = -1;

    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        final int o = (y * width + x) * 4;
        final int lum = (src[o] * 299 + src[o + 1] * 587 + src[o + 2] * 114) ~/ 1000;
        if (lum < cutoff) {
          // Ink is rendered as solid near-black; anti-aliasing the edge would
          // reintroduce a grey halo of the paper.
          out[o] = 17;
          out[o + 1] = 17;
          out[o + 2] = 17;
          out[o + 3] = 255;
          inkCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
        // Everything else stays fully transparent (the buffer starts zeroed).
      }
    }

    if (inkCount < _minInkPixels || maxX < 0) return null;

    final Uint8List cropped = _crop(out, width, height, minX, minY, maxX, maxY);
    final int cw = maxX - minX + 1;
    final int ch = maxY - minY + 1;

    final ui.Image image = await _fromPixels(cropped, cw, ch);
    final ByteData? png = await image.toByteData(format: ui.ImageByteFormat.png);
    image.dispose();
    return png?.buffer.asUint8List();
  }

  /// Trims to the ink's bounding box with a small margin, so the signature is
  /// not a stamp-sized mark lost in a page of empty space.
  static Uint8List _crop(
    Uint8List src, int width, int height, int minX, int minY, int maxX, int maxY,
  ) {
    const int pad = 8;
    minX = (minX - pad).clamp(0, width - 1);
    minY = (minY - pad).clamp(0, height - 1);
    maxX = (maxX + pad).clamp(0, width - 1);
    maxY = (maxY + pad).clamp(0, height - 1);

    final int cw = maxX - minX + 1;
    final int ch = maxY - minY + 1;
    final Uint8List out = Uint8List(cw * ch * 4);
    for (int y = 0; y < ch; y++) {
      final int srcStart = ((minY + y) * width + minX) * 4;
      out.setRange(y * cw * 4, (y + 1) * cw * 4, src, srcStart);
    }
    return out;
  }

  static Future<ui.Image> _decode(Uint8List bytes) {
    final completer = Completer<ui.Image>();
    ui.decodeImageFromList(bytes, completer.complete);
    return completer.future;
  }

  static Future<ui.Image> _fromPixels(Uint8List rgba, int width, int height) {
    final completer = Completer<ui.Image>();
    ui.decodeImageFromPixels(rgba, width, height, ui.PixelFormat.rgba8888, completer.complete);
    return completer.future;
  }
}

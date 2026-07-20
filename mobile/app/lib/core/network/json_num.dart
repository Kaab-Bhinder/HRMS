/// Tolerant numeric parsing for JSON coming off the API.
///
/// Postgres `numeric`/`Decimal` columns are serialized by Prisma as *strings*
/// (`"25"`, `"1500.50"`) to avoid the precision loss of a JS double, while plain
/// `Int`/`Float` columns arrive as JSON numbers. A field's type therefore
/// depends on its column, and `value as num` throws a TypeError on the string
/// case — which surfaces as a whole screen failing to load rather than one bad
/// field.
///
/// Parse every numeric field through these instead of casting.
library;

/// Parses [v] whether it arrives as a number, a numeric string, or null.
/// Returns null for null, a non-numeric string, or any other type.
double? asDoubleOrNull(dynamic v) {
  if (v == null) return null;
  if (v is num) return v.toDouble();
  if (v is String) return double.tryParse(v);
  return null;
}

/// As [asDoubleOrNull], defaulting to [fallback] when absent or unparseable.
double asDouble(dynamic v, [double fallback = 0]) => asDoubleOrNull(v) ?? fallback;

/// Integer form. Truncates a fractional value rather than throwing, so
/// `"7.0"` in an int field yields 7.
int? asIntOrNull(dynamic v) => asDoubleOrNull(v)?.toInt();

/// As [asIntOrNull], defaulting to [fallback] when absent or unparseable.
int asInt(dynamic v, [int fallback = 0]) => asIntOrNull(v) ?? fallback;

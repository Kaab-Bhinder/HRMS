/// A captured location fix used when punching attendance.
class GeoPoint {
  const GeoPoint({required this.latitude, required this.longitude, this.accuracyMeters});
  final double latitude;
  final double longitude;
  final double? accuracyMeters;
}

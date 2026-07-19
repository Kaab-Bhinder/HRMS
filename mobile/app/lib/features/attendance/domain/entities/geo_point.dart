/// A captured location fix used when punching attendance.
class GeoPoint {
  const GeoPoint({required this.latitude, required this.longitude, this.accuracyMeters, this.isMocked = false});
  final double latitude;
  final double longitude;
  final double? accuracyMeters;

  /// True when the OS reports the fix came from a mock/fake-location provider.
  final bool isMocked;
}

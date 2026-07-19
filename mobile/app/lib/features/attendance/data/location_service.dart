import 'package:geolocator/geolocator.dart';
import '../domain/entities/geo_point.dart';

/// Friendly, typed location failure the UI can present as-is.
class LocationException implements Exception {
  LocationException(this.message, {this.openSettings = false});
  final String message;
  final bool openSettings; // hint the UI to offer "Open settings"
  @override
  String toString() => message;
}

/// Wraps geolocator: checks the service + permission, then returns a high-
/// accuracy fix. Every failure mode maps to a clear, actionable message.
class LocationService {
  Future<GeoPoint> currentPosition() async {
    if (!await Geolocator.isLocationServiceEnabled()) {
      throw LocationException('Location is turned off. Enable it to check in.');
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied) {
      throw LocationException('Location permission is needed to verify your check-in.');
    }
    if (permission == LocationPermission.deniedForever) {
      throw LocationException(
        'Location permission is permanently denied. Enable it in Settings to check in.',
        openSettings: true,
      );
    }

    final pos = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, timeLimit: Duration(seconds: 15)),
    );
    // `isMocked` flags fake-GPS apps — sent to the server so HR can review it.
    return GeoPoint(latitude: pos.latitude, longitude: pos.longitude, accuracyMeters: pos.accuracy, isMocked: pos.isMocked);
  }
}

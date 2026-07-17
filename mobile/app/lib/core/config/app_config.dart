/// Environment configuration.
///
/// The API host is resolved at startup by probing [candidates] in parallel and
/// picking the first that answers `/health` — so the app keeps working when you
/// switch Wi-Fi, or run on an emulator/simulator, without a rebuild.
///
/// You can still force a specific host at build time (this wins over probing):
///   flutter run --dart-define=API_BASE_URL=http://HOST:4000/api/v1
abstract final class AppConfig {
  static const String _override = String.fromEnvironment('API_BASE_URL');

  /// Known API hosts to try, in priority order. Add new dev-machine IPs here.
  ///   • LAN IPs   → physical phone on the same Wi-Fi
  ///   • 10.0.2.2  → Android emulator → host loopback
  ///   • localhost → iOS simulator
  static const List<String> candidates = [
    'http://192.168.100.141:4000/api/v1', // current Wi-Fi
    'http://192.168.18.15:4000/api/v1',   // previous Wi-Fi
    'http://10.0.2.2:4000/api/v1',        // Android emulator
    'http://localhost:4000/api/v1',       // iOS simulator
  ];

  /// The active base URL. Resolved at startup by [resolveApiHost]; defaults to
  /// the override (if any) or the first candidate.
  static String apiBaseUrl = _override.isNotEmpty ? _override : candidates.first;

  /// True when a build-time override was supplied (skip host probing).
  static bool get hasOverride => _override.isNotEmpty;

  /// This app always authenticates as the mobile platform (per-role platform gate).
  static const String platform = 'mobile';

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 20);
}

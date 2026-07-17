import 'dart:async';
import 'package:dio/dio.dart';
import '../config/app_config.dart';

/// Picks the first reachable API host from [AppConfig.candidates] and sets it as
/// the active base URL — so the app works across networks (new/old Wi-Fi,
/// emulator, simulator) without a rebuild. A build-time override always wins.
///
/// Probes run in parallel; the first `/health` 200 wins. Bounded to ~3s so a
/// fully-offline start doesn't stall the splash.
Future<void> resolveApiHost() async {
  if (AppConfig.hasOverride) return;
  final base = await _firstReachable(AppConfig.candidates);
  if (base != null) AppConfig.apiBaseUrl = base;
}

Future<String?> _firstReachable(List<String> bases) {
  final completer = Completer<String?>();
  var pending = bases.length;

  void settleIfDone() {
    pending--;
    if (pending == 0 && !completer.isCompleted) completer.complete(null);
  }

  for (final base in bases) {
    // Immediately-invoked async probe per host.
    () async {
      try {
        final dio = Dio(BaseOptions(
          connectTimeout: const Duration(seconds: 2),
          receiveTimeout: const Duration(seconds: 2),
        ));
        final res = await dio.get('$base/health');
        if ((res.statusCode ?? 0) == 200 && !completer.isCompleted) {
          completer.complete(base);
        }
      } catch (_) {
        // host unreachable — ignore
      } finally {
        settleIfDone();
      }
    }();
  }

  return completer.future.timeout(const Duration(seconds: 3), onTimeout: () => null);
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'core/di/providers.dart';
import 'core/network/api_host_resolver.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(statusBarColor: Colors.transparent),
  );

  // Pick a reachable API host (handles Wi-Fi changes / emulator / simulator),
  // then hydrate stored tokens — both before the first network call on splash.
  final container = ProviderContainer();
  await Future.wait([
    resolveApiHost(),
    container.read(tokenStorageProvider).load(),
  ]);

  runApp(
    UncontrolledProviderScope(
      container: container,
      child: const WmsApp(),
    ),
  );
}

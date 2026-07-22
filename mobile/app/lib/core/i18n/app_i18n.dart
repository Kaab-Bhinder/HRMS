import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'id_strings.dart';

/// Supported languages. Mirrors the web app: English and Bahasa Indonesia.
enum AppLang { en, id }

const _key = 'app_lang';

/// Current language, persisted per device.
///
/// Same model as the web dashboard: strings are keyed by their English source,
/// and the Indonesian dictionary maps them. Anything not in the dictionary
/// falls back to English, so a missing entry renders in English rather than
/// showing a blank or a key.
class LocaleController extends StateNotifier<AppLang> {
  LocaleController(this._storage) : super(AppLang.en) {
    _restore();
  }

  final FlutterSecureStorage _storage;

  Future<void> _restore() async {
    try {
      final saved = await _storage.read(key: _key);
      if (saved == 'id') state = AppLang.id;
    } catch (_) {
      /* keep English */
    }
  }

  Future<void> set(AppLang lang) async {
    state = lang;
    try {
      await _storage.write(key: _key, value: lang == AppLang.id ? 'id' : 'en');
    } catch (_) {
      /* best-effort */
    }
  }

  Future<void> toggle() => set(state == AppLang.en ? AppLang.id : AppLang.en);
}

final localeControllerProvider = StateNotifierProvider<LocaleController, AppLang>(
  (ref) => LocaleController(const FlutterSecureStorage()),
);

/// Translates an English UI string for [lang]. English passes through.
String translate(String en, AppLang lang) {
  if (lang == AppLang.en) return en;
  return idStrings[en] ?? en;
}

/// Carries the active language down the tree as an [InheritedWidget], so any
/// widget with a [BuildContext] — Consumer or not — rebuilds when it changes.
/// Wrapped around the app in `app.dart`.
class I18nScope extends InheritedWidget {
  const I18nScope({super.key, required this.lang, required super.child});

  final AppLang lang;

  static AppLang of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<I18nScope>();
    return scope?.lang ?? AppLang.en;
  }

  @override
  bool updateShouldNotify(I18nScope oldWidget) => oldWidget.lang != lang;
}

/// `context.tr('Check in')` → the translated string, rebuilding on language
/// change. Available on every widget, so no build-method plumbing is needed.
extension I18nX on BuildContext {
  String tr(String en) => translate(en, I18nScope.of(this));

  /// Interpolates `{}` placeholders after translating: `tf('{} of {} days', [a, b])`.
  String tf(String en, List<Object> args) {
    var out = tr(en);
    for (final a in args) {
      out = out.replaceFirst('{}', '$a');
    }
    return out;
  }
}

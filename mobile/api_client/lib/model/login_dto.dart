//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class LoginDto {
  /// Returns a new [LoginDto] instance.
  LoginDto({
    required this.email,
    required this.password,
    this.platform = const LoginDtoPlatformEnum._('web'),
  });

  String email;

  String password;

  /// Which app is signing in. React sends \"web\", Flutter sends \"mobile\".
  LoginDtoPlatformEnum platform;

  @override
  bool operator ==(Object other) => identical(this, other) || other is LoginDto &&
    other.email == email &&
    other.password == password &&
    other.platform == platform;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (email.hashCode) +
    (password.hashCode) +
    (platform.hashCode);

  @override
  String toString() => 'LoginDto[email=$email, password=$password, platform=$platform]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'email'] = this.email;
      json[r'password'] = this.password;
      json[r'platform'] = this.platform;
    return json;
  }

  /// Returns a new [LoginDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static LoginDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'email'), 'Required key "LoginDto[email]" is missing from JSON.');
        assert(json[r'email'] != null, 'Required key "LoginDto[email]" has a null value in JSON.');
        assert(json.containsKey(r'password'), 'Required key "LoginDto[password]" is missing from JSON.');
        assert(json[r'password'] != null, 'Required key "LoginDto[password]" has a null value in JSON.');
        return true;
      }());

      return LoginDto(
        email: mapValueOfType<String>(json, r'email')!,
        password: mapValueOfType<String>(json, r'password')!,
        platform: LoginDtoPlatformEnum.fromJson(json[r'platform']) ?? const LoginDtoPlatformEnum._('web'),
      );
    }
    return null;
  }

  static List<LoginDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <LoginDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = LoginDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, LoginDto> mapFromJson(dynamic json) {
    final map = <String, LoginDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = LoginDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of LoginDto-objects as value to a dart map
  static Map<String, List<LoginDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<LoginDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = LoginDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'email',
    'password',
  };
}

/// Which app is signing in. React sends \"web\", Flutter sends \"mobile\".
class LoginDtoPlatformEnum {
  /// Instantiate a new enum with the provided [value].
  const LoginDtoPlatformEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const web = LoginDtoPlatformEnum._(r'web');
  static const mobile = LoginDtoPlatformEnum._(r'mobile');

  /// List of all possible values in this [enum][LoginDtoPlatformEnum].
  static const values = <LoginDtoPlatformEnum>[
    web,
    mobile,
  ];

  static LoginDtoPlatformEnum? fromJson(dynamic value) => LoginDtoPlatformEnumTypeTransformer().decode(value);

  static List<LoginDtoPlatformEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <LoginDtoPlatformEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = LoginDtoPlatformEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [LoginDtoPlatformEnum] to String,
/// and [decode] dynamic data back to [LoginDtoPlatformEnum].
class LoginDtoPlatformEnumTypeTransformer {
  factory LoginDtoPlatformEnumTypeTransformer() => _instance ??= const LoginDtoPlatformEnumTypeTransformer._();

  const LoginDtoPlatformEnumTypeTransformer._();

  String encode(LoginDtoPlatformEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a LoginDtoPlatformEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  LoginDtoPlatformEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'web': return LoginDtoPlatformEnum.web;
        case r'mobile': return LoginDtoPlatformEnum.mobile;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [LoginDtoPlatformEnumTypeTransformer] instance.
  static LoginDtoPlatformEnumTypeTransformer? _instance;
}



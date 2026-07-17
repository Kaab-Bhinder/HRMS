//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UpdateOrganizationDto {
  /// Returns a new [UpdateOrganizationDto] instance.
  UpdateOrganizationDto({
    this.name,
    this.legalName,
    this.timezone,
    this.locale,
    this.currency,
    this.logoUrl,
    this.settings = const {},
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? name;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? legalName;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? timezone;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? locale;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? currency;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? logoUrl;

  Map<String, Object> settings;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UpdateOrganizationDto &&
    other.name == name &&
    other.legalName == legalName &&
    other.timezone == timezone &&
    other.locale == locale &&
    other.currency == currency &&
    other.logoUrl == logoUrl &&
    _deepEquality.equals(other.settings, settings);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (name == null ? 0 : name!.hashCode) +
    (legalName == null ? 0 : legalName!.hashCode) +
    (timezone == null ? 0 : timezone!.hashCode) +
    (locale == null ? 0 : locale!.hashCode) +
    (currency == null ? 0 : currency!.hashCode) +
    (logoUrl == null ? 0 : logoUrl!.hashCode) +
    (settings.hashCode);

  @override
  String toString() => 'UpdateOrganizationDto[name=$name, legalName=$legalName, timezone=$timezone, locale=$locale, currency=$currency, logoUrl=$logoUrl, settings=$settings]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.name != null) {
      json[r'name'] = this.name;
    } else {
      json[r'name'] = null;
    }
    if (this.legalName != null) {
      json[r'legalName'] = this.legalName;
    } else {
      json[r'legalName'] = null;
    }
    if (this.timezone != null) {
      json[r'timezone'] = this.timezone;
    } else {
      json[r'timezone'] = null;
    }
    if (this.locale != null) {
      json[r'locale'] = this.locale;
    } else {
      json[r'locale'] = null;
    }
    if (this.currency != null) {
      json[r'currency'] = this.currency;
    } else {
      json[r'currency'] = null;
    }
    if (this.logoUrl != null) {
      json[r'logoUrl'] = this.logoUrl;
    } else {
      json[r'logoUrl'] = null;
    }
      json[r'settings'] = this.settings;
    return json;
  }

  /// Returns a new [UpdateOrganizationDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateOrganizationDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return UpdateOrganizationDto(
        name: mapValueOfType<String>(json, r'name'),
        legalName: mapValueOfType<String>(json, r'legalName'),
        timezone: mapValueOfType<String>(json, r'timezone'),
        locale: mapValueOfType<String>(json, r'locale'),
        currency: mapValueOfType<String>(json, r'currency'),
        logoUrl: mapValueOfType<String>(json, r'logoUrl'),
        settings: mapCastOfType<String, Object>(json, r'settings') ?? const {},
      );
    }
    return null;
  }

  static List<UpdateOrganizationDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateOrganizationDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateOrganizationDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateOrganizationDto> mapFromJson(dynamic json) {
    final map = <String, UpdateOrganizationDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateOrganizationDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateOrganizationDto-objects as value to a dart map
  static Map<String, List<UpdateOrganizationDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateOrganizationDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateOrganizationDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


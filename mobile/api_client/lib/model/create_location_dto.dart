//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CreateLocationDto {
  /// Returns a new [CreateLocationDto] instance.
  CreateLocationDto({
    this.name,
    this.address,
    this.latitude,
    this.longitude,
    this.radiusMeters,
    this.timezone,
    this.isActive,
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
  String? address;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? latitude;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? longitude;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? radiusMeters;

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
  bool? isActive;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CreateLocationDto &&
    other.name == name &&
    other.address == address &&
    other.latitude == latitude &&
    other.longitude == longitude &&
    other.radiusMeters == radiusMeters &&
    other.timezone == timezone &&
    other.isActive == isActive;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (name == null ? 0 : name!.hashCode) +
    (address == null ? 0 : address!.hashCode) +
    (latitude == null ? 0 : latitude!.hashCode) +
    (longitude == null ? 0 : longitude!.hashCode) +
    (radiusMeters == null ? 0 : radiusMeters!.hashCode) +
    (timezone == null ? 0 : timezone!.hashCode) +
    (isActive == null ? 0 : isActive!.hashCode);

  @override
  String toString() => 'CreateLocationDto[name=$name, address=$address, latitude=$latitude, longitude=$longitude, radiusMeters=$radiusMeters, timezone=$timezone, isActive=$isActive]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.name != null) {
      json[r'name'] = this.name;
    } else {
      json[r'name'] = null;
    }
    if (this.address != null) {
      json[r'address'] = this.address;
    } else {
      json[r'address'] = null;
    }
    if (this.latitude != null) {
      json[r'latitude'] = this.latitude;
    } else {
      json[r'latitude'] = null;
    }
    if (this.longitude != null) {
      json[r'longitude'] = this.longitude;
    } else {
      json[r'longitude'] = null;
    }
    if (this.radiusMeters != null) {
      json[r'radiusMeters'] = this.radiusMeters;
    } else {
      json[r'radiusMeters'] = null;
    }
    if (this.timezone != null) {
      json[r'timezone'] = this.timezone;
    } else {
      json[r'timezone'] = null;
    }
    if (this.isActive != null) {
      json[r'isActive'] = this.isActive;
    } else {
      json[r'isActive'] = null;
    }
    return json;
  }

  /// Returns a new [CreateLocationDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CreateLocationDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return CreateLocationDto(
        name: mapValueOfType<String>(json, r'name'),
        address: mapValueOfType<String>(json, r'address'),
        latitude: num.parse('${json[r'latitude']}'),
        longitude: num.parse('${json[r'longitude']}'),
        radiusMeters: num.parse('${json[r'radiusMeters']}'),
        timezone: mapValueOfType<String>(json, r'timezone'),
        isActive: mapValueOfType<bool>(json, r'isActive'),
      );
    }
    return null;
  }

  static List<CreateLocationDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateLocationDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateLocationDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CreateLocationDto> mapFromJson(dynamic json) {
    final map = <String, CreateLocationDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CreateLocationDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CreateLocationDto-objects as value to a dart map
  static Map<String, List<CreateLocationDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CreateLocationDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CreateLocationDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


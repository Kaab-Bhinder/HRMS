//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class PingPointDto {
  /// Returns a new [PingPointDto] instance.
  PingPointDto({
    required this.recordedAt,
    required this.latitude,
    required this.longitude,
    this.accuracyMeters,
    this.speed,
    this.battery,
    this.isMoving,
  });

  String recordedAt;

  num latitude;

  num longitude;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? accuracyMeters;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? speed;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? battery;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? isMoving;

  @override
  bool operator ==(Object other) => identical(this, other) || other is PingPointDto &&
    other.recordedAt == recordedAt &&
    other.latitude == latitude &&
    other.longitude == longitude &&
    other.accuracyMeters == accuracyMeters &&
    other.speed == speed &&
    other.battery == battery &&
    other.isMoving == isMoving;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (recordedAt.hashCode) +
    (latitude.hashCode) +
    (longitude.hashCode) +
    (accuracyMeters == null ? 0 : accuracyMeters!.hashCode) +
    (speed == null ? 0 : speed!.hashCode) +
    (battery == null ? 0 : battery!.hashCode) +
    (isMoving == null ? 0 : isMoving!.hashCode);

  @override
  String toString() => 'PingPointDto[recordedAt=$recordedAt, latitude=$latitude, longitude=$longitude, accuracyMeters=$accuracyMeters, speed=$speed, battery=$battery, isMoving=$isMoving]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'recordedAt'] = this.recordedAt;
      json[r'latitude'] = this.latitude;
      json[r'longitude'] = this.longitude;
    if (this.accuracyMeters != null) {
      json[r'accuracyMeters'] = this.accuracyMeters;
    } else {
      json[r'accuracyMeters'] = null;
    }
    if (this.speed != null) {
      json[r'speed'] = this.speed;
    } else {
      json[r'speed'] = null;
    }
    if (this.battery != null) {
      json[r'battery'] = this.battery;
    } else {
      json[r'battery'] = null;
    }
    if (this.isMoving != null) {
      json[r'isMoving'] = this.isMoving;
    } else {
      json[r'isMoving'] = null;
    }
    return json;
  }

  /// Returns a new [PingPointDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static PingPointDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'recordedAt'), 'Required key "PingPointDto[recordedAt]" is missing from JSON.');
        assert(json[r'recordedAt'] != null, 'Required key "PingPointDto[recordedAt]" has a null value in JSON.');
        assert(json.containsKey(r'latitude'), 'Required key "PingPointDto[latitude]" is missing from JSON.');
        assert(json[r'latitude'] != null, 'Required key "PingPointDto[latitude]" has a null value in JSON.');
        assert(json.containsKey(r'longitude'), 'Required key "PingPointDto[longitude]" is missing from JSON.');
        assert(json[r'longitude'] != null, 'Required key "PingPointDto[longitude]" has a null value in JSON.');
        return true;
      }());

      return PingPointDto(
        recordedAt: mapValueOfType<String>(json, r'recordedAt')!,
        latitude: num.parse('${json[r'latitude']}'),
        longitude: num.parse('${json[r'longitude']}'),
        accuracyMeters: num.parse('${json[r'accuracyMeters']}'),
        speed: num.parse('${json[r'speed']}'),
        battery: num.parse('${json[r'battery']}'),
        isMoving: mapValueOfType<bool>(json, r'isMoving'),
      );
    }
    return null;
  }

  static List<PingPointDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <PingPointDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = PingPointDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, PingPointDto> mapFromJson(dynamic json) {
    final map = <String, PingPointDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = PingPointDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of PingPointDto-objects as value to a dart map
  static Map<String, List<PingPointDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<PingPointDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = PingPointDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'recordedAt',
    'latitude',
    'longitude',
  };
}


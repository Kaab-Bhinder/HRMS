//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class MapUserDto {
  /// Returns a new [MapUserDto] instance.
  MapUserDto({
    required this.deviceUserId,
    required this.employeeId,
  });

  String deviceUserId;

  String employeeId;

  @override
  bool operator ==(Object other) => identical(this, other) || other is MapUserDto &&
    other.deviceUserId == deviceUserId &&
    other.employeeId == employeeId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (deviceUserId.hashCode) +
    (employeeId.hashCode);

  @override
  String toString() => 'MapUserDto[deviceUserId=$deviceUserId, employeeId=$employeeId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'deviceUserId'] = this.deviceUserId;
      json[r'employeeId'] = this.employeeId;
    return json;
  }

  /// Returns a new [MapUserDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static MapUserDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'deviceUserId'), 'Required key "MapUserDto[deviceUserId]" is missing from JSON.');
        assert(json[r'deviceUserId'] != null, 'Required key "MapUserDto[deviceUserId]" has a null value in JSON.');
        assert(json.containsKey(r'employeeId'), 'Required key "MapUserDto[employeeId]" is missing from JSON.');
        assert(json[r'employeeId'] != null, 'Required key "MapUserDto[employeeId]" has a null value in JSON.');
        return true;
      }());

      return MapUserDto(
        deviceUserId: mapValueOfType<String>(json, r'deviceUserId')!,
        employeeId: mapValueOfType<String>(json, r'employeeId')!,
      );
    }
    return null;
  }

  static List<MapUserDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MapUserDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MapUserDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, MapUserDto> mapFromJson(dynamic json) {
    final map = <String, MapUserDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = MapUserDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of MapUserDto-objects as value to a dart map
  static Map<String, List<MapUserDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<MapUserDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = MapUserDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'deviceUserId',
    'employeeId',
  };
}


//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UpdateCycleDto {
  /// Returns a new [UpdateCycleDto] instance.
  UpdateCycleDto({
    this.name,
    this.startDate,
    this.endDate,
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
  String? startDate;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? endDate;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? isActive;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UpdateCycleDto &&
    other.name == name &&
    other.startDate == startDate &&
    other.endDate == endDate &&
    other.isActive == isActive;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (name == null ? 0 : name!.hashCode) +
    (startDate == null ? 0 : startDate!.hashCode) +
    (endDate == null ? 0 : endDate!.hashCode) +
    (isActive == null ? 0 : isActive!.hashCode);

  @override
  String toString() => 'UpdateCycleDto[name=$name, startDate=$startDate, endDate=$endDate, isActive=$isActive]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.name != null) {
      json[r'name'] = this.name;
    } else {
      json[r'name'] = null;
    }
    if (this.startDate != null) {
      json[r'startDate'] = this.startDate;
    } else {
      json[r'startDate'] = null;
    }
    if (this.endDate != null) {
      json[r'endDate'] = this.endDate;
    } else {
      json[r'endDate'] = null;
    }
    if (this.isActive != null) {
      json[r'isActive'] = this.isActive;
    } else {
      json[r'isActive'] = null;
    }
    return json;
  }

  /// Returns a new [UpdateCycleDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateCycleDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return UpdateCycleDto(
        name: mapValueOfType<String>(json, r'name'),
        startDate: mapValueOfType<String>(json, r'startDate'),
        endDate: mapValueOfType<String>(json, r'endDate'),
        isActive: mapValueOfType<bool>(json, r'isActive'),
      );
    }
    return null;
  }

  static List<UpdateCycleDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateCycleDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateCycleDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateCycleDto> mapFromJson(dynamic json) {
    final map = <String, UpdateCycleDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateCycleDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateCycleDto-objects as value to a dart map
  static Map<String, List<UpdateCycleDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateCycleDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateCycleDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


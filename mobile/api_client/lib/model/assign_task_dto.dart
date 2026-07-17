//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class AssignTaskDto {
  /// Returns a new [AssignTaskDto] instance.
  AssignTaskDto({
    required this.employeeId,
    this.role,
  });

  String employeeId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? role;

  @override
  bool operator ==(Object other) => identical(this, other) || other is AssignTaskDto &&
    other.employeeId == employeeId &&
    other.role == role;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (employeeId.hashCode) +
    (role == null ? 0 : role!.hashCode);

  @override
  String toString() => 'AssignTaskDto[employeeId=$employeeId, role=$role]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'employeeId'] = this.employeeId;
    if (this.role != null) {
      json[r'role'] = this.role;
    } else {
      json[r'role'] = null;
    }
    return json;
  }

  /// Returns a new [AssignTaskDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static AssignTaskDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'employeeId'), 'Required key "AssignTaskDto[employeeId]" is missing from JSON.');
        assert(json[r'employeeId'] != null, 'Required key "AssignTaskDto[employeeId]" has a null value in JSON.');
        return true;
      }());

      return AssignTaskDto(
        employeeId: mapValueOfType<String>(json, r'employeeId')!,
        role: mapValueOfType<String>(json, r'role'),
      );
    }
    return null;
  }

  static List<AssignTaskDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <AssignTaskDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = AssignTaskDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, AssignTaskDto> mapFromJson(dynamic json) {
    final map = <String, AssignTaskDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = AssignTaskDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of AssignTaskDto-objects as value to a dart map
  static Map<String, List<AssignTaskDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<AssignTaskDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = AssignTaskDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'employeeId',
  };
}


//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ManualEntryDto {
  /// Returns a new [ManualEntryDto] instance.
  ManualEntryDto({
    required this.employeeId,
    required this.workDate,
    this.checkInAt,
    this.checkOutAt,
    this.note,
  });

  String employeeId;

  String workDate;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? checkInAt;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? checkOutAt;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? note;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ManualEntryDto &&
    other.employeeId == employeeId &&
    other.workDate == workDate &&
    other.checkInAt == checkInAt &&
    other.checkOutAt == checkOutAt &&
    other.note == note;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (employeeId.hashCode) +
    (workDate.hashCode) +
    (checkInAt == null ? 0 : checkInAt!.hashCode) +
    (checkOutAt == null ? 0 : checkOutAt!.hashCode) +
    (note == null ? 0 : note!.hashCode);

  @override
  String toString() => 'ManualEntryDto[employeeId=$employeeId, workDate=$workDate, checkInAt=$checkInAt, checkOutAt=$checkOutAt, note=$note]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'employeeId'] = this.employeeId;
      json[r'workDate'] = this.workDate;
    if (this.checkInAt != null) {
      json[r'checkInAt'] = this.checkInAt;
    } else {
      json[r'checkInAt'] = null;
    }
    if (this.checkOutAt != null) {
      json[r'checkOutAt'] = this.checkOutAt;
    } else {
      json[r'checkOutAt'] = null;
    }
    if (this.note != null) {
      json[r'note'] = this.note;
    } else {
      json[r'note'] = null;
    }
    return json;
  }

  /// Returns a new [ManualEntryDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ManualEntryDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'employeeId'), 'Required key "ManualEntryDto[employeeId]" is missing from JSON.');
        assert(json[r'employeeId'] != null, 'Required key "ManualEntryDto[employeeId]" has a null value in JSON.');
        assert(json.containsKey(r'workDate'), 'Required key "ManualEntryDto[workDate]" is missing from JSON.');
        assert(json[r'workDate'] != null, 'Required key "ManualEntryDto[workDate]" has a null value in JSON.');
        return true;
      }());

      return ManualEntryDto(
        employeeId: mapValueOfType<String>(json, r'employeeId')!,
        workDate: mapValueOfType<String>(json, r'workDate')!,
        checkInAt: mapValueOfType<String>(json, r'checkInAt'),
        checkOutAt: mapValueOfType<String>(json, r'checkOutAt'),
        note: mapValueOfType<String>(json, r'note'),
      );
    }
    return null;
  }

  static List<ManualEntryDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ManualEntryDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ManualEntryDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ManualEntryDto> mapFromJson(dynamic json) {
    final map = <String, ManualEntryDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ManualEntryDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ManualEntryDto-objects as value to a dart map
  static Map<String, List<ManualEntryDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ManualEntryDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ManualEntryDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'employeeId',
    'workDate',
  };
}


//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class RegularizationDto {
  /// Returns a new [RegularizationDto] instance.
  RegularizationDto({
    required this.workDate,
    required this.reason,
    this.employeeId,
    this.requestedInAt,
    this.requestedOutAt,
  });

  String workDate;

  String reason;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? employeeId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? requestedInAt;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? requestedOutAt;

  @override
  bool operator ==(Object other) => identical(this, other) || other is RegularizationDto &&
    other.workDate == workDate &&
    other.reason == reason &&
    other.employeeId == employeeId &&
    other.requestedInAt == requestedInAt &&
    other.requestedOutAt == requestedOutAt;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (workDate.hashCode) +
    (reason.hashCode) +
    (employeeId == null ? 0 : employeeId!.hashCode) +
    (requestedInAt == null ? 0 : requestedInAt!.hashCode) +
    (requestedOutAt == null ? 0 : requestedOutAt!.hashCode);

  @override
  String toString() => 'RegularizationDto[workDate=$workDate, reason=$reason, employeeId=$employeeId, requestedInAt=$requestedInAt, requestedOutAt=$requestedOutAt]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'workDate'] = this.workDate;
      json[r'reason'] = this.reason;
    if (this.employeeId != null) {
      json[r'employeeId'] = this.employeeId;
    } else {
      json[r'employeeId'] = null;
    }
    if (this.requestedInAt != null) {
      json[r'requestedInAt'] = this.requestedInAt;
    } else {
      json[r'requestedInAt'] = null;
    }
    if (this.requestedOutAt != null) {
      json[r'requestedOutAt'] = this.requestedOutAt;
    } else {
      json[r'requestedOutAt'] = null;
    }
    return json;
  }

  /// Returns a new [RegularizationDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static RegularizationDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'workDate'), 'Required key "RegularizationDto[workDate]" is missing from JSON.');
        assert(json[r'workDate'] != null, 'Required key "RegularizationDto[workDate]" has a null value in JSON.');
        assert(json.containsKey(r'reason'), 'Required key "RegularizationDto[reason]" is missing from JSON.');
        assert(json[r'reason'] != null, 'Required key "RegularizationDto[reason]" has a null value in JSON.');
        return true;
      }());

      return RegularizationDto(
        workDate: mapValueOfType<String>(json, r'workDate')!,
        reason: mapValueOfType<String>(json, r'reason')!,
        employeeId: mapValueOfType<String>(json, r'employeeId'),
        requestedInAt: mapValueOfType<String>(json, r'requestedInAt'),
        requestedOutAt: mapValueOfType<String>(json, r'requestedOutAt'),
      );
    }
    return null;
  }

  static List<RegularizationDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RegularizationDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RegularizationDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, RegularizationDto> mapFromJson(dynamic json) {
    final map = <String, RegularizationDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = RegularizationDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of RegularizationDto-objects as value to a dart map
  static Map<String, List<RegularizationDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<RegularizationDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = RegularizationDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'workDate',
    'reason',
  };
}


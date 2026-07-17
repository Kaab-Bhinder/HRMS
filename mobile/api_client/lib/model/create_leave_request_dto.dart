//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CreateLeaveRequestDto {
  /// Returns a new [CreateLeaveRequestDto] instance.
  CreateLeaveRequestDto({
    required this.leaveTypeId,
    required this.startDate,
    required this.endDate,
    this.reason,
    this.employeeId,
    this.customFields = const {},
  });

  String leaveTypeId;

  String startDate;

  String endDate;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? reason;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? employeeId;

  Map<String, Object> customFields;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CreateLeaveRequestDto &&
    other.leaveTypeId == leaveTypeId &&
    other.startDate == startDate &&
    other.endDate == endDate &&
    other.reason == reason &&
    other.employeeId == employeeId &&
    _deepEquality.equals(other.customFields, customFields);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (leaveTypeId.hashCode) +
    (startDate.hashCode) +
    (endDate.hashCode) +
    (reason == null ? 0 : reason!.hashCode) +
    (employeeId == null ? 0 : employeeId!.hashCode) +
    (customFields.hashCode);

  @override
  String toString() => 'CreateLeaveRequestDto[leaveTypeId=$leaveTypeId, startDate=$startDate, endDate=$endDate, reason=$reason, employeeId=$employeeId, customFields=$customFields]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'leaveTypeId'] = this.leaveTypeId;
      json[r'startDate'] = this.startDate;
      json[r'endDate'] = this.endDate;
    if (this.reason != null) {
      json[r'reason'] = this.reason;
    } else {
      json[r'reason'] = null;
    }
    if (this.employeeId != null) {
      json[r'employeeId'] = this.employeeId;
    } else {
      json[r'employeeId'] = null;
    }
      json[r'customFields'] = this.customFields;
    return json;
  }

  /// Returns a new [CreateLeaveRequestDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CreateLeaveRequestDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'leaveTypeId'), 'Required key "CreateLeaveRequestDto[leaveTypeId]" is missing from JSON.');
        assert(json[r'leaveTypeId'] != null, 'Required key "CreateLeaveRequestDto[leaveTypeId]" has a null value in JSON.');
        assert(json.containsKey(r'startDate'), 'Required key "CreateLeaveRequestDto[startDate]" is missing from JSON.');
        assert(json[r'startDate'] != null, 'Required key "CreateLeaveRequestDto[startDate]" has a null value in JSON.');
        assert(json.containsKey(r'endDate'), 'Required key "CreateLeaveRequestDto[endDate]" is missing from JSON.');
        assert(json[r'endDate'] != null, 'Required key "CreateLeaveRequestDto[endDate]" has a null value in JSON.');
        return true;
      }());

      return CreateLeaveRequestDto(
        leaveTypeId: mapValueOfType<String>(json, r'leaveTypeId')!,
        startDate: mapValueOfType<String>(json, r'startDate')!,
        endDate: mapValueOfType<String>(json, r'endDate')!,
        reason: mapValueOfType<String>(json, r'reason'),
        employeeId: mapValueOfType<String>(json, r'employeeId'),
        customFields: mapCastOfType<String, Object>(json, r'customFields') ?? const {},
      );
    }
    return null;
  }

  static List<CreateLeaveRequestDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateLeaveRequestDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateLeaveRequestDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CreateLeaveRequestDto> mapFromJson(dynamic json) {
    final map = <String, CreateLeaveRequestDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CreateLeaveRequestDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CreateLeaveRequestDto-objects as value to a dart map
  static Map<String, List<CreateLeaveRequestDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CreateLeaveRequestDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CreateLeaveRequestDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'leaveTypeId',
    'startDate',
    'endDate',
  };
}


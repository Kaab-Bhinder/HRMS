//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CreateLeaveTypeDto {
  /// Returns a new [CreateLeaveTypeDto] instance.
  CreateLeaveTypeDto({
    required this.name,
    required this.code,
    this.isPaid,
    this.accrualPerYear,
    this.carryForwardMax,
    this.allowNegative,
    this.colorHex,
  });

  String name;

  String code;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? isPaid;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? accrualPerYear;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? carryForwardMax;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? allowNegative;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? colorHex;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CreateLeaveTypeDto &&
    other.name == name &&
    other.code == code &&
    other.isPaid == isPaid &&
    other.accrualPerYear == accrualPerYear &&
    other.carryForwardMax == carryForwardMax &&
    other.allowNegative == allowNegative &&
    other.colorHex == colorHex;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (name.hashCode) +
    (code.hashCode) +
    (isPaid == null ? 0 : isPaid!.hashCode) +
    (accrualPerYear == null ? 0 : accrualPerYear!.hashCode) +
    (carryForwardMax == null ? 0 : carryForwardMax!.hashCode) +
    (allowNegative == null ? 0 : allowNegative!.hashCode) +
    (colorHex == null ? 0 : colorHex!.hashCode);

  @override
  String toString() => 'CreateLeaveTypeDto[name=$name, code=$code, isPaid=$isPaid, accrualPerYear=$accrualPerYear, carryForwardMax=$carryForwardMax, allowNegative=$allowNegative, colorHex=$colorHex]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'name'] = this.name;
      json[r'code'] = this.code;
    if (this.isPaid != null) {
      json[r'isPaid'] = this.isPaid;
    } else {
      json[r'isPaid'] = null;
    }
    if (this.accrualPerYear != null) {
      json[r'accrualPerYear'] = this.accrualPerYear;
    } else {
      json[r'accrualPerYear'] = null;
    }
    if (this.carryForwardMax != null) {
      json[r'carryForwardMax'] = this.carryForwardMax;
    } else {
      json[r'carryForwardMax'] = null;
    }
    if (this.allowNegative != null) {
      json[r'allowNegative'] = this.allowNegative;
    } else {
      json[r'allowNegative'] = null;
    }
    if (this.colorHex != null) {
      json[r'colorHex'] = this.colorHex;
    } else {
      json[r'colorHex'] = null;
    }
    return json;
  }

  /// Returns a new [CreateLeaveTypeDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CreateLeaveTypeDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'name'), 'Required key "CreateLeaveTypeDto[name]" is missing from JSON.');
        assert(json[r'name'] != null, 'Required key "CreateLeaveTypeDto[name]" has a null value in JSON.');
        assert(json.containsKey(r'code'), 'Required key "CreateLeaveTypeDto[code]" is missing from JSON.');
        assert(json[r'code'] != null, 'Required key "CreateLeaveTypeDto[code]" has a null value in JSON.');
        return true;
      }());

      return CreateLeaveTypeDto(
        name: mapValueOfType<String>(json, r'name')!,
        code: mapValueOfType<String>(json, r'code')!,
        isPaid: mapValueOfType<bool>(json, r'isPaid'),
        accrualPerYear: num.parse('${json[r'accrualPerYear']}'),
        carryForwardMax: num.parse('${json[r'carryForwardMax']}'),
        allowNegative: mapValueOfType<bool>(json, r'allowNegative'),
        colorHex: mapValueOfType<String>(json, r'colorHex'),
      );
    }
    return null;
  }

  static List<CreateLeaveTypeDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateLeaveTypeDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateLeaveTypeDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CreateLeaveTypeDto> mapFromJson(dynamic json) {
    final map = <String, CreateLeaveTypeDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CreateLeaveTypeDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CreateLeaveTypeDto-objects as value to a dart map
  static Map<String, List<CreateLeaveTypeDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CreateLeaveTypeDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CreateLeaveTypeDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'name',
    'code',
  };
}


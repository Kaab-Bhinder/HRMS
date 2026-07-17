//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CreateDepartmentDto {
  /// Returns a new [CreateDepartmentDto] instance.
  CreateDepartmentDto({
    required this.name,
    this.code,
    this.description,
    this.parentId,
    this.headEmployeeId,
    this.costCenter,
    this.isActive,
  });

  String name;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? code;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? description;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? parentId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? headEmployeeId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? costCenter;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? isActive;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CreateDepartmentDto &&
    other.name == name &&
    other.code == code &&
    other.description == description &&
    other.parentId == parentId &&
    other.headEmployeeId == headEmployeeId &&
    other.costCenter == costCenter &&
    other.isActive == isActive;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (name.hashCode) +
    (code == null ? 0 : code!.hashCode) +
    (description == null ? 0 : description!.hashCode) +
    (parentId == null ? 0 : parentId!.hashCode) +
    (headEmployeeId == null ? 0 : headEmployeeId!.hashCode) +
    (costCenter == null ? 0 : costCenter!.hashCode) +
    (isActive == null ? 0 : isActive!.hashCode);

  @override
  String toString() => 'CreateDepartmentDto[name=$name, code=$code, description=$description, parentId=$parentId, headEmployeeId=$headEmployeeId, costCenter=$costCenter, isActive=$isActive]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'name'] = this.name;
    if (this.code != null) {
      json[r'code'] = this.code;
    } else {
      json[r'code'] = null;
    }
    if (this.description != null) {
      json[r'description'] = this.description;
    } else {
      json[r'description'] = null;
    }
    if (this.parentId != null) {
      json[r'parentId'] = this.parentId;
    } else {
      json[r'parentId'] = null;
    }
    if (this.headEmployeeId != null) {
      json[r'headEmployeeId'] = this.headEmployeeId;
    } else {
      json[r'headEmployeeId'] = null;
    }
    if (this.costCenter != null) {
      json[r'costCenter'] = this.costCenter;
    } else {
      json[r'costCenter'] = null;
    }
    if (this.isActive != null) {
      json[r'isActive'] = this.isActive;
    } else {
      json[r'isActive'] = null;
    }
    return json;
  }

  /// Returns a new [CreateDepartmentDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CreateDepartmentDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'name'), 'Required key "CreateDepartmentDto[name]" is missing from JSON.');
        assert(json[r'name'] != null, 'Required key "CreateDepartmentDto[name]" has a null value in JSON.');
        return true;
      }());

      return CreateDepartmentDto(
        name: mapValueOfType<String>(json, r'name')!,
        code: mapValueOfType<String>(json, r'code'),
        description: mapValueOfType<String>(json, r'description'),
        parentId: mapValueOfType<String>(json, r'parentId'),
        headEmployeeId: mapValueOfType<String>(json, r'headEmployeeId'),
        costCenter: mapValueOfType<String>(json, r'costCenter'),
        isActive: mapValueOfType<bool>(json, r'isActive'),
      );
    }
    return null;
  }

  static List<CreateDepartmentDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateDepartmentDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateDepartmentDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CreateDepartmentDto> mapFromJson(dynamic json) {
    final map = <String, CreateDepartmentDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CreateDepartmentDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CreateDepartmentDto-objects as value to a dart map
  static Map<String, List<CreateDepartmentDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CreateDepartmentDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CreateDepartmentDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'name',
  };
}


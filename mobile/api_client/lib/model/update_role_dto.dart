//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UpdateRoleDto {
  /// Returns a new [UpdateRoleDto] instance.
  UpdateRoleDto({
    this.name,
    this.description,
    this.permissions = const [],
    this.canAccessWeb,
    this.canAccessMobile,
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
  String? description;

  /// Permission keys, e.g. [\"employees:read\"]
  List<String> permissions;

  /// Can users with this role sign in to the web admin app
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? canAccessWeb;

  /// Can users with this role sign in to the mobile app
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? canAccessMobile;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UpdateRoleDto &&
    other.name == name &&
    other.description == description &&
    _deepEquality.equals(other.permissions, permissions) &&
    other.canAccessWeb == canAccessWeb &&
    other.canAccessMobile == canAccessMobile;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (name == null ? 0 : name!.hashCode) +
    (description == null ? 0 : description!.hashCode) +
    (permissions.hashCode) +
    (canAccessWeb == null ? 0 : canAccessWeb!.hashCode) +
    (canAccessMobile == null ? 0 : canAccessMobile!.hashCode);

  @override
  String toString() => 'UpdateRoleDto[name=$name, description=$description, permissions=$permissions, canAccessWeb=$canAccessWeb, canAccessMobile=$canAccessMobile]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.name != null) {
      json[r'name'] = this.name;
    } else {
      json[r'name'] = null;
    }
    if (this.description != null) {
      json[r'description'] = this.description;
    } else {
      json[r'description'] = null;
    }
      json[r'permissions'] = this.permissions;
    if (this.canAccessWeb != null) {
      json[r'canAccessWeb'] = this.canAccessWeb;
    } else {
      json[r'canAccessWeb'] = null;
    }
    if (this.canAccessMobile != null) {
      json[r'canAccessMobile'] = this.canAccessMobile;
    } else {
      json[r'canAccessMobile'] = null;
    }
    return json;
  }

  /// Returns a new [UpdateRoleDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateRoleDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return UpdateRoleDto(
        name: mapValueOfType<String>(json, r'name'),
        description: mapValueOfType<String>(json, r'description'),
        permissions: json[r'permissions'] is Iterable
            ? (json[r'permissions'] as Iterable).cast<String>().toList(growable: false)
            : const [],
        canAccessWeb: mapValueOfType<bool>(json, r'canAccessWeb'),
        canAccessMobile: mapValueOfType<bool>(json, r'canAccessMobile'),
      );
    }
    return null;
  }

  static List<UpdateRoleDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateRoleDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateRoleDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateRoleDto> mapFromJson(dynamic json) {
    final map = <String, UpdateRoleDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateRoleDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateRoleDto-objects as value to a dart map
  static Map<String, List<UpdateRoleDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateRoleDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateRoleDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


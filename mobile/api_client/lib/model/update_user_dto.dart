//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UpdateUserDto {
  /// Returns a new [UpdateUserDto] instance.
  UpdateUserDto({
    this.fullName,
    this.roleIds = const [],
    this.status,
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? fullName;

  List<String> roleIds;

  UpdateUserDtoStatusEnum? status;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UpdateUserDto &&
    other.fullName == fullName &&
    _deepEquality.equals(other.roleIds, roleIds) &&
    other.status == status;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (fullName == null ? 0 : fullName!.hashCode) +
    (roleIds.hashCode) +
    (status == null ? 0 : status!.hashCode);

  @override
  String toString() => 'UpdateUserDto[fullName=$fullName, roleIds=$roleIds, status=$status]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.fullName != null) {
      json[r'fullName'] = this.fullName;
    } else {
      json[r'fullName'] = null;
    }
      json[r'roleIds'] = this.roleIds;
    if (this.status != null) {
      json[r'status'] = this.status;
    } else {
      json[r'status'] = null;
    }
    return json;
  }

  /// Returns a new [UpdateUserDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateUserDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return UpdateUserDto(
        fullName: mapValueOfType<String>(json, r'fullName'),
        roleIds: json[r'roleIds'] is Iterable
            ? (json[r'roleIds'] as Iterable).cast<String>().toList(growable: false)
            : const [],
        status: UpdateUserDtoStatusEnum.fromJson(json[r'status']),
      );
    }
    return null;
  }

  static List<UpdateUserDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateUserDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateUserDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateUserDto> mapFromJson(dynamic json) {
    final map = <String, UpdateUserDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateUserDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateUserDto-objects as value to a dart map
  static Map<String, List<UpdateUserDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateUserDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateUserDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


class UpdateUserDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const UpdateUserDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const invited = UpdateUserDtoStatusEnum._(r'invited');
  static const active = UpdateUserDtoStatusEnum._(r'active');
  static const suspended = UpdateUserDtoStatusEnum._(r'suspended');
  static const disabled = UpdateUserDtoStatusEnum._(r'disabled');

  /// List of all possible values in this [enum][UpdateUserDtoStatusEnum].
  static const values = <UpdateUserDtoStatusEnum>[
    invited,
    active,
    suspended,
    disabled,
  ];

  static UpdateUserDtoStatusEnum? fromJson(dynamic value) => UpdateUserDtoStatusEnumTypeTransformer().decode(value);

  static List<UpdateUserDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateUserDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateUserDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateUserDtoStatusEnum] to String,
/// and [decode] dynamic data back to [UpdateUserDtoStatusEnum].
class UpdateUserDtoStatusEnumTypeTransformer {
  factory UpdateUserDtoStatusEnumTypeTransformer() => _instance ??= const UpdateUserDtoStatusEnumTypeTransformer._();

  const UpdateUserDtoStatusEnumTypeTransformer._();

  String encode(UpdateUserDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a UpdateUserDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateUserDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'invited': return UpdateUserDtoStatusEnum.invited;
        case r'active': return UpdateUserDtoStatusEnum.active;
        case r'suspended': return UpdateUserDtoStatusEnum.suspended;
        case r'disabled': return UpdateUserDtoStatusEnum.disabled;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [UpdateUserDtoStatusEnumTypeTransformer] instance.
  static UpdateUserDtoStatusEnumTypeTransformer? _instance;
}



//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CreateUserDto {
  /// Returns a new [CreateUserDto] instance.
  CreateUserDto({
    required this.email,
    required this.fullName,
    this.roleIds = const [],
    this.password,
    this.status,
  });

  String email;

  String fullName;

  /// Role ids to assign
  List<String> roleIds;

  /// Set an initial password (else the user is created as \"invited\")
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? password;

  CreateUserDtoStatusEnum? status;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CreateUserDto &&
    other.email == email &&
    other.fullName == fullName &&
    _deepEquality.equals(other.roleIds, roleIds) &&
    other.password == password &&
    other.status == status;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (email.hashCode) +
    (fullName.hashCode) +
    (roleIds.hashCode) +
    (password == null ? 0 : password!.hashCode) +
    (status == null ? 0 : status!.hashCode);

  @override
  String toString() => 'CreateUserDto[email=$email, fullName=$fullName, roleIds=$roleIds, password=$password, status=$status]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'email'] = this.email;
      json[r'fullName'] = this.fullName;
      json[r'roleIds'] = this.roleIds;
    if (this.password != null) {
      json[r'password'] = this.password;
    } else {
      json[r'password'] = null;
    }
    if (this.status != null) {
      json[r'status'] = this.status;
    } else {
      json[r'status'] = null;
    }
    return json;
  }

  /// Returns a new [CreateUserDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CreateUserDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'email'), 'Required key "CreateUserDto[email]" is missing from JSON.');
        assert(json[r'email'] != null, 'Required key "CreateUserDto[email]" has a null value in JSON.');
        assert(json.containsKey(r'fullName'), 'Required key "CreateUserDto[fullName]" is missing from JSON.');
        assert(json[r'fullName'] != null, 'Required key "CreateUserDto[fullName]" has a null value in JSON.');
        return true;
      }());

      return CreateUserDto(
        email: mapValueOfType<String>(json, r'email')!,
        fullName: mapValueOfType<String>(json, r'fullName')!,
        roleIds: json[r'roleIds'] is Iterable
            ? (json[r'roleIds'] as Iterable).cast<String>().toList(growable: false)
            : const [],
        password: mapValueOfType<String>(json, r'password'),
        status: CreateUserDtoStatusEnum.fromJson(json[r'status']),
      );
    }
    return null;
  }

  static List<CreateUserDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateUserDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateUserDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CreateUserDto> mapFromJson(dynamic json) {
    final map = <String, CreateUserDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CreateUserDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CreateUserDto-objects as value to a dart map
  static Map<String, List<CreateUserDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CreateUserDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CreateUserDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'email',
    'fullName',
  };
}


class CreateUserDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const CreateUserDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const invited = CreateUserDtoStatusEnum._(r'invited');
  static const active = CreateUserDtoStatusEnum._(r'active');
  static const suspended = CreateUserDtoStatusEnum._(r'suspended');
  static const disabled = CreateUserDtoStatusEnum._(r'disabled');

  /// List of all possible values in this [enum][CreateUserDtoStatusEnum].
  static const values = <CreateUserDtoStatusEnum>[
    invited,
    active,
    suspended,
    disabled,
  ];

  static CreateUserDtoStatusEnum? fromJson(dynamic value) => CreateUserDtoStatusEnumTypeTransformer().decode(value);

  static List<CreateUserDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateUserDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateUserDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [CreateUserDtoStatusEnum] to String,
/// and [decode] dynamic data back to [CreateUserDtoStatusEnum].
class CreateUserDtoStatusEnumTypeTransformer {
  factory CreateUserDtoStatusEnumTypeTransformer() => _instance ??= const CreateUserDtoStatusEnumTypeTransformer._();

  const CreateUserDtoStatusEnumTypeTransformer._();

  String encode(CreateUserDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a CreateUserDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  CreateUserDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'invited': return CreateUserDtoStatusEnum.invited;
        case r'active': return CreateUserDtoStatusEnum.active;
        case r'suspended': return CreateUserDtoStatusEnum.suspended;
        case r'disabled': return CreateUserDtoStatusEnum.disabled;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [CreateUserDtoStatusEnumTypeTransformer] instance.
  static CreateUserDtoStatusEnumTypeTransformer? _instance;
}



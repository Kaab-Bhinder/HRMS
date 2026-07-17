//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CreateEmployeeDto {
  /// Returns a new [CreateEmployeeDto] instance.
  CreateEmployeeDto({
    required this.firstName,
    required this.lastName,
    this.employeeCode,
    this.workEmail,
    this.personalEmail,
    this.phone,
    this.gender,
    this.dateOfBirth,
    this.departmentId,
    this.designationId,
    this.locationId,
    this.managerId,
    this.employmentType,
    this.status,
    this.dateOfJoining,
    this.customFields = const {},
    this.createAccount = true,
    this.accountRoleId,
    this.accountPasswordStrategy = const CreateEmployeeDtoAccountPasswordStrategyEnum._('generate'),
  });

  String firstName;

  String lastName;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? employeeCode;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? workEmail;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? personalEmail;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? phone;

  CreateEmployeeDtoGenderEnum? gender;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? dateOfBirth;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? departmentId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? designationId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? locationId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? managerId;

  CreateEmployeeDtoEmploymentTypeEnum? employmentType;

  CreateEmployeeDtoStatusEnum? status;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? dateOfJoining;

  Map<String, Object> customFields;

  /// Create a linked login account (default true).
  bool createAccount;

  /// Role for the login account. Defaults to the \"Employee\" role.
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? accountRoleId;

  /// \"generate\" returns a one-time password; \"invite\" creates the account as invited.
  CreateEmployeeDtoAccountPasswordStrategyEnum accountPasswordStrategy;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CreateEmployeeDto &&
    other.firstName == firstName &&
    other.lastName == lastName &&
    other.employeeCode == employeeCode &&
    other.workEmail == workEmail &&
    other.personalEmail == personalEmail &&
    other.phone == phone &&
    other.gender == gender &&
    other.dateOfBirth == dateOfBirth &&
    other.departmentId == departmentId &&
    other.designationId == designationId &&
    other.locationId == locationId &&
    other.managerId == managerId &&
    other.employmentType == employmentType &&
    other.status == status &&
    other.dateOfJoining == dateOfJoining &&
    _deepEquality.equals(other.customFields, customFields) &&
    other.createAccount == createAccount &&
    other.accountRoleId == accountRoleId &&
    other.accountPasswordStrategy == accountPasswordStrategy;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (firstName.hashCode) +
    (lastName.hashCode) +
    (employeeCode == null ? 0 : employeeCode!.hashCode) +
    (workEmail == null ? 0 : workEmail!.hashCode) +
    (personalEmail == null ? 0 : personalEmail!.hashCode) +
    (phone == null ? 0 : phone!.hashCode) +
    (gender == null ? 0 : gender!.hashCode) +
    (dateOfBirth == null ? 0 : dateOfBirth!.hashCode) +
    (departmentId == null ? 0 : departmentId!.hashCode) +
    (designationId == null ? 0 : designationId!.hashCode) +
    (locationId == null ? 0 : locationId!.hashCode) +
    (managerId == null ? 0 : managerId!.hashCode) +
    (employmentType == null ? 0 : employmentType!.hashCode) +
    (status == null ? 0 : status!.hashCode) +
    (dateOfJoining == null ? 0 : dateOfJoining!.hashCode) +
    (customFields.hashCode) +
    (createAccount.hashCode) +
    (accountRoleId == null ? 0 : accountRoleId!.hashCode) +
    (accountPasswordStrategy.hashCode);

  @override
  String toString() => 'CreateEmployeeDto[firstName=$firstName, lastName=$lastName, employeeCode=$employeeCode, workEmail=$workEmail, personalEmail=$personalEmail, phone=$phone, gender=$gender, dateOfBirth=$dateOfBirth, departmentId=$departmentId, designationId=$designationId, locationId=$locationId, managerId=$managerId, employmentType=$employmentType, status=$status, dateOfJoining=$dateOfJoining, customFields=$customFields, createAccount=$createAccount, accountRoleId=$accountRoleId, accountPasswordStrategy=$accountPasswordStrategy]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'firstName'] = this.firstName;
      json[r'lastName'] = this.lastName;
    if (this.employeeCode != null) {
      json[r'employeeCode'] = this.employeeCode;
    } else {
      json[r'employeeCode'] = null;
    }
    if (this.workEmail != null) {
      json[r'workEmail'] = this.workEmail;
    } else {
      json[r'workEmail'] = null;
    }
    if (this.personalEmail != null) {
      json[r'personalEmail'] = this.personalEmail;
    } else {
      json[r'personalEmail'] = null;
    }
    if (this.phone != null) {
      json[r'phone'] = this.phone;
    } else {
      json[r'phone'] = null;
    }
    if (this.gender != null) {
      json[r'gender'] = this.gender;
    } else {
      json[r'gender'] = null;
    }
    if (this.dateOfBirth != null) {
      json[r'dateOfBirth'] = this.dateOfBirth;
    } else {
      json[r'dateOfBirth'] = null;
    }
    if (this.departmentId != null) {
      json[r'departmentId'] = this.departmentId;
    } else {
      json[r'departmentId'] = null;
    }
    if (this.designationId != null) {
      json[r'designationId'] = this.designationId;
    } else {
      json[r'designationId'] = null;
    }
    if (this.locationId != null) {
      json[r'locationId'] = this.locationId;
    } else {
      json[r'locationId'] = null;
    }
    if (this.managerId != null) {
      json[r'managerId'] = this.managerId;
    } else {
      json[r'managerId'] = null;
    }
    if (this.employmentType != null) {
      json[r'employmentType'] = this.employmentType;
    } else {
      json[r'employmentType'] = null;
    }
    if (this.status != null) {
      json[r'status'] = this.status;
    } else {
      json[r'status'] = null;
    }
    if (this.dateOfJoining != null) {
      json[r'dateOfJoining'] = this.dateOfJoining;
    } else {
      json[r'dateOfJoining'] = null;
    }
      json[r'customFields'] = this.customFields;
      json[r'createAccount'] = this.createAccount;
    if (this.accountRoleId != null) {
      json[r'accountRoleId'] = this.accountRoleId;
    } else {
      json[r'accountRoleId'] = null;
    }
      json[r'accountPasswordStrategy'] = this.accountPasswordStrategy;
    return json;
  }

  /// Returns a new [CreateEmployeeDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CreateEmployeeDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'firstName'), 'Required key "CreateEmployeeDto[firstName]" is missing from JSON.');
        assert(json[r'firstName'] != null, 'Required key "CreateEmployeeDto[firstName]" has a null value in JSON.');
        assert(json.containsKey(r'lastName'), 'Required key "CreateEmployeeDto[lastName]" is missing from JSON.');
        assert(json[r'lastName'] != null, 'Required key "CreateEmployeeDto[lastName]" has a null value in JSON.');
        return true;
      }());

      return CreateEmployeeDto(
        firstName: mapValueOfType<String>(json, r'firstName')!,
        lastName: mapValueOfType<String>(json, r'lastName')!,
        employeeCode: mapValueOfType<String>(json, r'employeeCode'),
        workEmail: mapValueOfType<String>(json, r'workEmail'),
        personalEmail: mapValueOfType<String>(json, r'personalEmail'),
        phone: mapValueOfType<String>(json, r'phone'),
        gender: CreateEmployeeDtoGenderEnum.fromJson(json[r'gender']),
        dateOfBirth: mapValueOfType<String>(json, r'dateOfBirth'),
        departmentId: mapValueOfType<String>(json, r'departmentId'),
        designationId: mapValueOfType<String>(json, r'designationId'),
        locationId: mapValueOfType<String>(json, r'locationId'),
        managerId: mapValueOfType<String>(json, r'managerId'),
        employmentType: CreateEmployeeDtoEmploymentTypeEnum.fromJson(json[r'employmentType']),
        status: CreateEmployeeDtoStatusEnum.fromJson(json[r'status']),
        dateOfJoining: mapValueOfType<String>(json, r'dateOfJoining'),
        customFields: mapCastOfType<String, Object>(json, r'customFields') ?? const {},
        createAccount: mapValueOfType<bool>(json, r'createAccount') ?? true,
        accountRoleId: mapValueOfType<String>(json, r'accountRoleId'),
        accountPasswordStrategy: CreateEmployeeDtoAccountPasswordStrategyEnum.fromJson(json[r'accountPasswordStrategy']) ?? const CreateEmployeeDtoAccountPasswordStrategyEnum._('generate'),
      );
    }
    return null;
  }

  static List<CreateEmployeeDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateEmployeeDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateEmployeeDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CreateEmployeeDto> mapFromJson(dynamic json) {
    final map = <String, CreateEmployeeDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CreateEmployeeDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CreateEmployeeDto-objects as value to a dart map
  static Map<String, List<CreateEmployeeDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CreateEmployeeDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CreateEmployeeDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'firstName',
    'lastName',
  };
}


class CreateEmployeeDtoGenderEnum {
  /// Instantiate a new enum with the provided [value].
  const CreateEmployeeDtoGenderEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const male = CreateEmployeeDtoGenderEnum._(r'male');
  static const female = CreateEmployeeDtoGenderEnum._(r'female');
  static const other = CreateEmployeeDtoGenderEnum._(r'other');
  static const undisclosed = CreateEmployeeDtoGenderEnum._(r'undisclosed');

  /// List of all possible values in this [enum][CreateEmployeeDtoGenderEnum].
  static const values = <CreateEmployeeDtoGenderEnum>[
    male,
    female,
    other,
    undisclosed,
  ];

  static CreateEmployeeDtoGenderEnum? fromJson(dynamic value) => CreateEmployeeDtoGenderEnumTypeTransformer().decode(value);

  static List<CreateEmployeeDtoGenderEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateEmployeeDtoGenderEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateEmployeeDtoGenderEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [CreateEmployeeDtoGenderEnum] to String,
/// and [decode] dynamic data back to [CreateEmployeeDtoGenderEnum].
class CreateEmployeeDtoGenderEnumTypeTransformer {
  factory CreateEmployeeDtoGenderEnumTypeTransformer() => _instance ??= const CreateEmployeeDtoGenderEnumTypeTransformer._();

  const CreateEmployeeDtoGenderEnumTypeTransformer._();

  String encode(CreateEmployeeDtoGenderEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a CreateEmployeeDtoGenderEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  CreateEmployeeDtoGenderEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'male': return CreateEmployeeDtoGenderEnum.male;
        case r'female': return CreateEmployeeDtoGenderEnum.female;
        case r'other': return CreateEmployeeDtoGenderEnum.other;
        case r'undisclosed': return CreateEmployeeDtoGenderEnum.undisclosed;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [CreateEmployeeDtoGenderEnumTypeTransformer] instance.
  static CreateEmployeeDtoGenderEnumTypeTransformer? _instance;
}



class CreateEmployeeDtoEmploymentTypeEnum {
  /// Instantiate a new enum with the provided [value].
  const CreateEmployeeDtoEmploymentTypeEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const fullTime = CreateEmployeeDtoEmploymentTypeEnum._(r'full_time');
  static const partTime = CreateEmployeeDtoEmploymentTypeEnum._(r'part_time');
  static const contract = CreateEmployeeDtoEmploymentTypeEnum._(r'contract');
  static const intern = CreateEmployeeDtoEmploymentTypeEnum._(r'intern');
  static const consultant = CreateEmployeeDtoEmploymentTypeEnum._(r'consultant');

  /// List of all possible values in this [enum][CreateEmployeeDtoEmploymentTypeEnum].
  static const values = <CreateEmployeeDtoEmploymentTypeEnum>[
    fullTime,
    partTime,
    contract,
    intern,
    consultant,
  ];

  static CreateEmployeeDtoEmploymentTypeEnum? fromJson(dynamic value) => CreateEmployeeDtoEmploymentTypeEnumTypeTransformer().decode(value);

  static List<CreateEmployeeDtoEmploymentTypeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateEmployeeDtoEmploymentTypeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateEmployeeDtoEmploymentTypeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [CreateEmployeeDtoEmploymentTypeEnum] to String,
/// and [decode] dynamic data back to [CreateEmployeeDtoEmploymentTypeEnum].
class CreateEmployeeDtoEmploymentTypeEnumTypeTransformer {
  factory CreateEmployeeDtoEmploymentTypeEnumTypeTransformer() => _instance ??= const CreateEmployeeDtoEmploymentTypeEnumTypeTransformer._();

  const CreateEmployeeDtoEmploymentTypeEnumTypeTransformer._();

  String encode(CreateEmployeeDtoEmploymentTypeEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a CreateEmployeeDtoEmploymentTypeEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  CreateEmployeeDtoEmploymentTypeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'full_time': return CreateEmployeeDtoEmploymentTypeEnum.fullTime;
        case r'part_time': return CreateEmployeeDtoEmploymentTypeEnum.partTime;
        case r'contract': return CreateEmployeeDtoEmploymentTypeEnum.contract;
        case r'intern': return CreateEmployeeDtoEmploymentTypeEnum.intern;
        case r'consultant': return CreateEmployeeDtoEmploymentTypeEnum.consultant;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [CreateEmployeeDtoEmploymentTypeEnumTypeTransformer] instance.
  static CreateEmployeeDtoEmploymentTypeEnumTypeTransformer? _instance;
}



class CreateEmployeeDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const CreateEmployeeDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const probation = CreateEmployeeDtoStatusEnum._(r'probation');
  static const active = CreateEmployeeDtoStatusEnum._(r'active');
  static const onLeave = CreateEmployeeDtoStatusEnum._(r'on_leave');
  static const suspended = CreateEmployeeDtoStatusEnum._(r'suspended');
  static const resigned = CreateEmployeeDtoStatusEnum._(r'resigned');
  static const terminated = CreateEmployeeDtoStatusEnum._(r'terminated');
  static const retired = CreateEmployeeDtoStatusEnum._(r'retired');

  /// List of all possible values in this [enum][CreateEmployeeDtoStatusEnum].
  static const values = <CreateEmployeeDtoStatusEnum>[
    probation,
    active,
    onLeave,
    suspended,
    resigned,
    terminated,
    retired,
  ];

  static CreateEmployeeDtoStatusEnum? fromJson(dynamic value) => CreateEmployeeDtoStatusEnumTypeTransformer().decode(value);

  static List<CreateEmployeeDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateEmployeeDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateEmployeeDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [CreateEmployeeDtoStatusEnum] to String,
/// and [decode] dynamic data back to [CreateEmployeeDtoStatusEnum].
class CreateEmployeeDtoStatusEnumTypeTransformer {
  factory CreateEmployeeDtoStatusEnumTypeTransformer() => _instance ??= const CreateEmployeeDtoStatusEnumTypeTransformer._();

  const CreateEmployeeDtoStatusEnumTypeTransformer._();

  String encode(CreateEmployeeDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a CreateEmployeeDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  CreateEmployeeDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'probation': return CreateEmployeeDtoStatusEnum.probation;
        case r'active': return CreateEmployeeDtoStatusEnum.active;
        case r'on_leave': return CreateEmployeeDtoStatusEnum.onLeave;
        case r'suspended': return CreateEmployeeDtoStatusEnum.suspended;
        case r'resigned': return CreateEmployeeDtoStatusEnum.resigned;
        case r'terminated': return CreateEmployeeDtoStatusEnum.terminated;
        case r'retired': return CreateEmployeeDtoStatusEnum.retired;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [CreateEmployeeDtoStatusEnumTypeTransformer] instance.
  static CreateEmployeeDtoStatusEnumTypeTransformer? _instance;
}


/// \"generate\" returns a one-time password; \"invite\" creates the account as invited.
class CreateEmployeeDtoAccountPasswordStrategyEnum {
  /// Instantiate a new enum with the provided [value].
  const CreateEmployeeDtoAccountPasswordStrategyEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const generate = CreateEmployeeDtoAccountPasswordStrategyEnum._(r'generate');
  static const invite = CreateEmployeeDtoAccountPasswordStrategyEnum._(r'invite');

  /// List of all possible values in this [enum][CreateEmployeeDtoAccountPasswordStrategyEnum].
  static const values = <CreateEmployeeDtoAccountPasswordStrategyEnum>[
    generate,
    invite,
  ];

  static CreateEmployeeDtoAccountPasswordStrategyEnum? fromJson(dynamic value) => CreateEmployeeDtoAccountPasswordStrategyEnumTypeTransformer().decode(value);

  static List<CreateEmployeeDtoAccountPasswordStrategyEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateEmployeeDtoAccountPasswordStrategyEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateEmployeeDtoAccountPasswordStrategyEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [CreateEmployeeDtoAccountPasswordStrategyEnum] to String,
/// and [decode] dynamic data back to [CreateEmployeeDtoAccountPasswordStrategyEnum].
class CreateEmployeeDtoAccountPasswordStrategyEnumTypeTransformer {
  factory CreateEmployeeDtoAccountPasswordStrategyEnumTypeTransformer() => _instance ??= const CreateEmployeeDtoAccountPasswordStrategyEnumTypeTransformer._();

  const CreateEmployeeDtoAccountPasswordStrategyEnumTypeTransformer._();

  String encode(CreateEmployeeDtoAccountPasswordStrategyEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a CreateEmployeeDtoAccountPasswordStrategyEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  CreateEmployeeDtoAccountPasswordStrategyEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'generate': return CreateEmployeeDtoAccountPasswordStrategyEnum.generate;
        case r'invite': return CreateEmployeeDtoAccountPasswordStrategyEnum.invite;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [CreateEmployeeDtoAccountPasswordStrategyEnumTypeTransformer] instance.
  static CreateEmployeeDtoAccountPasswordStrategyEnumTypeTransformer? _instance;
}



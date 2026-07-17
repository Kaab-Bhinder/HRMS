//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UpdateEmployeeDto {
  /// Returns a new [UpdateEmployeeDto] instance.
  UpdateEmployeeDto({
    this.firstName,
    this.lastName,
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
    this.accountPasswordStrategy = const UpdateEmployeeDtoAccountPasswordStrategyEnum._('generate'),
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? firstName;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? lastName;

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

  UpdateEmployeeDtoGenderEnum? gender;

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

  UpdateEmployeeDtoEmploymentTypeEnum? employmentType;

  UpdateEmployeeDtoStatusEnum? status;

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
  UpdateEmployeeDtoAccountPasswordStrategyEnum accountPasswordStrategy;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UpdateEmployeeDto &&
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
    (firstName == null ? 0 : firstName!.hashCode) +
    (lastName == null ? 0 : lastName!.hashCode) +
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
  String toString() => 'UpdateEmployeeDto[firstName=$firstName, lastName=$lastName, employeeCode=$employeeCode, workEmail=$workEmail, personalEmail=$personalEmail, phone=$phone, gender=$gender, dateOfBirth=$dateOfBirth, departmentId=$departmentId, designationId=$designationId, locationId=$locationId, managerId=$managerId, employmentType=$employmentType, status=$status, dateOfJoining=$dateOfJoining, customFields=$customFields, createAccount=$createAccount, accountRoleId=$accountRoleId, accountPasswordStrategy=$accountPasswordStrategy]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.firstName != null) {
      json[r'firstName'] = this.firstName;
    } else {
      json[r'firstName'] = null;
    }
    if (this.lastName != null) {
      json[r'lastName'] = this.lastName;
    } else {
      json[r'lastName'] = null;
    }
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

  /// Returns a new [UpdateEmployeeDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateEmployeeDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return UpdateEmployeeDto(
        firstName: mapValueOfType<String>(json, r'firstName'),
        lastName: mapValueOfType<String>(json, r'lastName'),
        employeeCode: mapValueOfType<String>(json, r'employeeCode'),
        workEmail: mapValueOfType<String>(json, r'workEmail'),
        personalEmail: mapValueOfType<String>(json, r'personalEmail'),
        phone: mapValueOfType<String>(json, r'phone'),
        gender: UpdateEmployeeDtoGenderEnum.fromJson(json[r'gender']),
        dateOfBirth: mapValueOfType<String>(json, r'dateOfBirth'),
        departmentId: mapValueOfType<String>(json, r'departmentId'),
        designationId: mapValueOfType<String>(json, r'designationId'),
        locationId: mapValueOfType<String>(json, r'locationId'),
        managerId: mapValueOfType<String>(json, r'managerId'),
        employmentType: UpdateEmployeeDtoEmploymentTypeEnum.fromJson(json[r'employmentType']),
        status: UpdateEmployeeDtoStatusEnum.fromJson(json[r'status']),
        dateOfJoining: mapValueOfType<String>(json, r'dateOfJoining'),
        customFields: mapCastOfType<String, Object>(json, r'customFields') ?? const {},
        createAccount: mapValueOfType<bool>(json, r'createAccount') ?? true,
        accountRoleId: mapValueOfType<String>(json, r'accountRoleId'),
        accountPasswordStrategy: UpdateEmployeeDtoAccountPasswordStrategyEnum.fromJson(json[r'accountPasswordStrategy']) ?? const UpdateEmployeeDtoAccountPasswordStrategyEnum._('generate'),
      );
    }
    return null;
  }

  static List<UpdateEmployeeDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateEmployeeDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateEmployeeDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateEmployeeDto> mapFromJson(dynamic json) {
    final map = <String, UpdateEmployeeDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateEmployeeDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateEmployeeDto-objects as value to a dart map
  static Map<String, List<UpdateEmployeeDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateEmployeeDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateEmployeeDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


class UpdateEmployeeDtoGenderEnum {
  /// Instantiate a new enum with the provided [value].
  const UpdateEmployeeDtoGenderEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const male = UpdateEmployeeDtoGenderEnum._(r'male');
  static const female = UpdateEmployeeDtoGenderEnum._(r'female');
  static const other = UpdateEmployeeDtoGenderEnum._(r'other');
  static const undisclosed = UpdateEmployeeDtoGenderEnum._(r'undisclosed');

  /// List of all possible values in this [enum][UpdateEmployeeDtoGenderEnum].
  static const values = <UpdateEmployeeDtoGenderEnum>[
    male,
    female,
    other,
    undisclosed,
  ];

  static UpdateEmployeeDtoGenderEnum? fromJson(dynamic value) => UpdateEmployeeDtoGenderEnumTypeTransformer().decode(value);

  static List<UpdateEmployeeDtoGenderEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateEmployeeDtoGenderEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateEmployeeDtoGenderEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateEmployeeDtoGenderEnum] to String,
/// and [decode] dynamic data back to [UpdateEmployeeDtoGenderEnum].
class UpdateEmployeeDtoGenderEnumTypeTransformer {
  factory UpdateEmployeeDtoGenderEnumTypeTransformer() => _instance ??= const UpdateEmployeeDtoGenderEnumTypeTransformer._();

  const UpdateEmployeeDtoGenderEnumTypeTransformer._();

  String encode(UpdateEmployeeDtoGenderEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a UpdateEmployeeDtoGenderEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateEmployeeDtoGenderEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'male': return UpdateEmployeeDtoGenderEnum.male;
        case r'female': return UpdateEmployeeDtoGenderEnum.female;
        case r'other': return UpdateEmployeeDtoGenderEnum.other;
        case r'undisclosed': return UpdateEmployeeDtoGenderEnum.undisclosed;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [UpdateEmployeeDtoGenderEnumTypeTransformer] instance.
  static UpdateEmployeeDtoGenderEnumTypeTransformer? _instance;
}



class UpdateEmployeeDtoEmploymentTypeEnum {
  /// Instantiate a new enum with the provided [value].
  const UpdateEmployeeDtoEmploymentTypeEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const fullTime = UpdateEmployeeDtoEmploymentTypeEnum._(r'full_time');
  static const partTime = UpdateEmployeeDtoEmploymentTypeEnum._(r'part_time');
  static const contract = UpdateEmployeeDtoEmploymentTypeEnum._(r'contract');
  static const intern = UpdateEmployeeDtoEmploymentTypeEnum._(r'intern');
  static const consultant = UpdateEmployeeDtoEmploymentTypeEnum._(r'consultant');

  /// List of all possible values in this [enum][UpdateEmployeeDtoEmploymentTypeEnum].
  static const values = <UpdateEmployeeDtoEmploymentTypeEnum>[
    fullTime,
    partTime,
    contract,
    intern,
    consultant,
  ];

  static UpdateEmployeeDtoEmploymentTypeEnum? fromJson(dynamic value) => UpdateEmployeeDtoEmploymentTypeEnumTypeTransformer().decode(value);

  static List<UpdateEmployeeDtoEmploymentTypeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateEmployeeDtoEmploymentTypeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateEmployeeDtoEmploymentTypeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateEmployeeDtoEmploymentTypeEnum] to String,
/// and [decode] dynamic data back to [UpdateEmployeeDtoEmploymentTypeEnum].
class UpdateEmployeeDtoEmploymentTypeEnumTypeTransformer {
  factory UpdateEmployeeDtoEmploymentTypeEnumTypeTransformer() => _instance ??= const UpdateEmployeeDtoEmploymentTypeEnumTypeTransformer._();

  const UpdateEmployeeDtoEmploymentTypeEnumTypeTransformer._();

  String encode(UpdateEmployeeDtoEmploymentTypeEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a UpdateEmployeeDtoEmploymentTypeEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateEmployeeDtoEmploymentTypeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'full_time': return UpdateEmployeeDtoEmploymentTypeEnum.fullTime;
        case r'part_time': return UpdateEmployeeDtoEmploymentTypeEnum.partTime;
        case r'contract': return UpdateEmployeeDtoEmploymentTypeEnum.contract;
        case r'intern': return UpdateEmployeeDtoEmploymentTypeEnum.intern;
        case r'consultant': return UpdateEmployeeDtoEmploymentTypeEnum.consultant;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [UpdateEmployeeDtoEmploymentTypeEnumTypeTransformer] instance.
  static UpdateEmployeeDtoEmploymentTypeEnumTypeTransformer? _instance;
}



class UpdateEmployeeDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const UpdateEmployeeDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const probation = UpdateEmployeeDtoStatusEnum._(r'probation');
  static const active = UpdateEmployeeDtoStatusEnum._(r'active');
  static const onLeave = UpdateEmployeeDtoStatusEnum._(r'on_leave');
  static const suspended = UpdateEmployeeDtoStatusEnum._(r'suspended');
  static const resigned = UpdateEmployeeDtoStatusEnum._(r'resigned');
  static const terminated = UpdateEmployeeDtoStatusEnum._(r'terminated');
  static const retired = UpdateEmployeeDtoStatusEnum._(r'retired');

  /// List of all possible values in this [enum][UpdateEmployeeDtoStatusEnum].
  static const values = <UpdateEmployeeDtoStatusEnum>[
    probation,
    active,
    onLeave,
    suspended,
    resigned,
    terminated,
    retired,
  ];

  static UpdateEmployeeDtoStatusEnum? fromJson(dynamic value) => UpdateEmployeeDtoStatusEnumTypeTransformer().decode(value);

  static List<UpdateEmployeeDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateEmployeeDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateEmployeeDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateEmployeeDtoStatusEnum] to String,
/// and [decode] dynamic data back to [UpdateEmployeeDtoStatusEnum].
class UpdateEmployeeDtoStatusEnumTypeTransformer {
  factory UpdateEmployeeDtoStatusEnumTypeTransformer() => _instance ??= const UpdateEmployeeDtoStatusEnumTypeTransformer._();

  const UpdateEmployeeDtoStatusEnumTypeTransformer._();

  String encode(UpdateEmployeeDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a UpdateEmployeeDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateEmployeeDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'probation': return UpdateEmployeeDtoStatusEnum.probation;
        case r'active': return UpdateEmployeeDtoStatusEnum.active;
        case r'on_leave': return UpdateEmployeeDtoStatusEnum.onLeave;
        case r'suspended': return UpdateEmployeeDtoStatusEnum.suspended;
        case r'resigned': return UpdateEmployeeDtoStatusEnum.resigned;
        case r'terminated': return UpdateEmployeeDtoStatusEnum.terminated;
        case r'retired': return UpdateEmployeeDtoStatusEnum.retired;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [UpdateEmployeeDtoStatusEnumTypeTransformer] instance.
  static UpdateEmployeeDtoStatusEnumTypeTransformer? _instance;
}


/// \"generate\" returns a one-time password; \"invite\" creates the account as invited.
class UpdateEmployeeDtoAccountPasswordStrategyEnum {
  /// Instantiate a new enum with the provided [value].
  const UpdateEmployeeDtoAccountPasswordStrategyEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const generate = UpdateEmployeeDtoAccountPasswordStrategyEnum._(r'generate');
  static const invite = UpdateEmployeeDtoAccountPasswordStrategyEnum._(r'invite');

  /// List of all possible values in this [enum][UpdateEmployeeDtoAccountPasswordStrategyEnum].
  static const values = <UpdateEmployeeDtoAccountPasswordStrategyEnum>[
    generate,
    invite,
  ];

  static UpdateEmployeeDtoAccountPasswordStrategyEnum? fromJson(dynamic value) => UpdateEmployeeDtoAccountPasswordStrategyEnumTypeTransformer().decode(value);

  static List<UpdateEmployeeDtoAccountPasswordStrategyEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateEmployeeDtoAccountPasswordStrategyEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateEmployeeDtoAccountPasswordStrategyEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateEmployeeDtoAccountPasswordStrategyEnum] to String,
/// and [decode] dynamic data back to [UpdateEmployeeDtoAccountPasswordStrategyEnum].
class UpdateEmployeeDtoAccountPasswordStrategyEnumTypeTransformer {
  factory UpdateEmployeeDtoAccountPasswordStrategyEnumTypeTransformer() => _instance ??= const UpdateEmployeeDtoAccountPasswordStrategyEnumTypeTransformer._();

  const UpdateEmployeeDtoAccountPasswordStrategyEnumTypeTransformer._();

  String encode(UpdateEmployeeDtoAccountPasswordStrategyEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a UpdateEmployeeDtoAccountPasswordStrategyEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateEmployeeDtoAccountPasswordStrategyEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'generate': return UpdateEmployeeDtoAccountPasswordStrategyEnum.generate;
        case r'invite': return UpdateEmployeeDtoAccountPasswordStrategyEnum.invite;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [UpdateEmployeeDtoAccountPasswordStrategyEnumTypeTransformer] instance.
  static UpdateEmployeeDtoAccountPasswordStrategyEnumTypeTransformer? _instance;
}



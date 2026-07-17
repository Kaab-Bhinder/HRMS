//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UpdateCustomFieldDto {
  /// Returns a new [UpdateCustomFieldDto] instance.
  UpdateCustomFieldDto({
    this.entity,
    this.fieldKey,
    this.label,
    this.dataType,
    this.helpText,
    this.placeholder,
    this.isRequired,
    this.isUnique,
    this.isVisible,
    this.isSearchable,
    this.isFilterable,
    this.isEncrypted,
    this.minValue,
    this.maxValue,
    this.minLength,
    this.maxLength,
    this.regexPattern,
    this.displayOrder,
    this.options = const [],
  });

  UpdateCustomFieldDtoEntityEnum? entity;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? fieldKey;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? label;

  UpdateCustomFieldDtoDataTypeEnum? dataType;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? helpText;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? placeholder;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? isRequired;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? isUnique;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? isVisible;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? isSearchable;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? isFilterable;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? isEncrypted;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? minValue;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? maxValue;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? minLength;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? maxLength;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? regexPattern;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? displayOrder;

  List<OptionDto> options;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UpdateCustomFieldDto &&
    other.entity == entity &&
    other.fieldKey == fieldKey &&
    other.label == label &&
    other.dataType == dataType &&
    other.helpText == helpText &&
    other.placeholder == placeholder &&
    other.isRequired == isRequired &&
    other.isUnique == isUnique &&
    other.isVisible == isVisible &&
    other.isSearchable == isSearchable &&
    other.isFilterable == isFilterable &&
    other.isEncrypted == isEncrypted &&
    other.minValue == minValue &&
    other.maxValue == maxValue &&
    other.minLength == minLength &&
    other.maxLength == maxLength &&
    other.regexPattern == regexPattern &&
    other.displayOrder == displayOrder &&
    _deepEquality.equals(other.options, options);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (entity == null ? 0 : entity!.hashCode) +
    (fieldKey == null ? 0 : fieldKey!.hashCode) +
    (label == null ? 0 : label!.hashCode) +
    (dataType == null ? 0 : dataType!.hashCode) +
    (helpText == null ? 0 : helpText!.hashCode) +
    (placeholder == null ? 0 : placeholder!.hashCode) +
    (isRequired == null ? 0 : isRequired!.hashCode) +
    (isUnique == null ? 0 : isUnique!.hashCode) +
    (isVisible == null ? 0 : isVisible!.hashCode) +
    (isSearchable == null ? 0 : isSearchable!.hashCode) +
    (isFilterable == null ? 0 : isFilterable!.hashCode) +
    (isEncrypted == null ? 0 : isEncrypted!.hashCode) +
    (minValue == null ? 0 : minValue!.hashCode) +
    (maxValue == null ? 0 : maxValue!.hashCode) +
    (minLength == null ? 0 : minLength!.hashCode) +
    (maxLength == null ? 0 : maxLength!.hashCode) +
    (regexPattern == null ? 0 : regexPattern!.hashCode) +
    (displayOrder == null ? 0 : displayOrder!.hashCode) +
    (options.hashCode);

  @override
  String toString() => 'UpdateCustomFieldDto[entity=$entity, fieldKey=$fieldKey, label=$label, dataType=$dataType, helpText=$helpText, placeholder=$placeholder, isRequired=$isRequired, isUnique=$isUnique, isVisible=$isVisible, isSearchable=$isSearchable, isFilterable=$isFilterable, isEncrypted=$isEncrypted, minValue=$minValue, maxValue=$maxValue, minLength=$minLength, maxLength=$maxLength, regexPattern=$regexPattern, displayOrder=$displayOrder, options=$options]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.entity != null) {
      json[r'entity'] = this.entity;
    } else {
      json[r'entity'] = null;
    }
    if (this.fieldKey != null) {
      json[r'fieldKey'] = this.fieldKey;
    } else {
      json[r'fieldKey'] = null;
    }
    if (this.label != null) {
      json[r'label'] = this.label;
    } else {
      json[r'label'] = null;
    }
    if (this.dataType != null) {
      json[r'dataType'] = this.dataType;
    } else {
      json[r'dataType'] = null;
    }
    if (this.helpText != null) {
      json[r'helpText'] = this.helpText;
    } else {
      json[r'helpText'] = null;
    }
    if (this.placeholder != null) {
      json[r'placeholder'] = this.placeholder;
    } else {
      json[r'placeholder'] = null;
    }
    if (this.isRequired != null) {
      json[r'isRequired'] = this.isRequired;
    } else {
      json[r'isRequired'] = null;
    }
    if (this.isUnique != null) {
      json[r'isUnique'] = this.isUnique;
    } else {
      json[r'isUnique'] = null;
    }
    if (this.isVisible != null) {
      json[r'isVisible'] = this.isVisible;
    } else {
      json[r'isVisible'] = null;
    }
    if (this.isSearchable != null) {
      json[r'isSearchable'] = this.isSearchable;
    } else {
      json[r'isSearchable'] = null;
    }
    if (this.isFilterable != null) {
      json[r'isFilterable'] = this.isFilterable;
    } else {
      json[r'isFilterable'] = null;
    }
    if (this.isEncrypted != null) {
      json[r'isEncrypted'] = this.isEncrypted;
    } else {
      json[r'isEncrypted'] = null;
    }
    if (this.minValue != null) {
      json[r'minValue'] = this.minValue;
    } else {
      json[r'minValue'] = null;
    }
    if (this.maxValue != null) {
      json[r'maxValue'] = this.maxValue;
    } else {
      json[r'maxValue'] = null;
    }
    if (this.minLength != null) {
      json[r'minLength'] = this.minLength;
    } else {
      json[r'minLength'] = null;
    }
    if (this.maxLength != null) {
      json[r'maxLength'] = this.maxLength;
    } else {
      json[r'maxLength'] = null;
    }
    if (this.regexPattern != null) {
      json[r'regexPattern'] = this.regexPattern;
    } else {
      json[r'regexPattern'] = null;
    }
    if (this.displayOrder != null) {
      json[r'displayOrder'] = this.displayOrder;
    } else {
      json[r'displayOrder'] = null;
    }
      json[r'options'] = this.options;
    return json;
  }

  /// Returns a new [UpdateCustomFieldDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateCustomFieldDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return UpdateCustomFieldDto(
        entity: UpdateCustomFieldDtoEntityEnum.fromJson(json[r'entity']),
        fieldKey: mapValueOfType<String>(json, r'fieldKey'),
        label: mapValueOfType<String>(json, r'label'),
        dataType: UpdateCustomFieldDtoDataTypeEnum.fromJson(json[r'dataType']),
        helpText: mapValueOfType<String>(json, r'helpText'),
        placeholder: mapValueOfType<String>(json, r'placeholder'),
        isRequired: mapValueOfType<bool>(json, r'isRequired'),
        isUnique: mapValueOfType<bool>(json, r'isUnique'),
        isVisible: mapValueOfType<bool>(json, r'isVisible'),
        isSearchable: mapValueOfType<bool>(json, r'isSearchable'),
        isFilterable: mapValueOfType<bool>(json, r'isFilterable'),
        isEncrypted: mapValueOfType<bool>(json, r'isEncrypted'),
        minValue: num.parse('${json[r'minValue']}'),
        maxValue: num.parse('${json[r'maxValue']}'),
        minLength: num.parse('${json[r'minLength']}'),
        maxLength: num.parse('${json[r'maxLength']}'),
        regexPattern: mapValueOfType<String>(json, r'regexPattern'),
        displayOrder: num.parse('${json[r'displayOrder']}'),
        options: OptionDto.listFromJson(json[r'options']),
      );
    }
    return null;
  }

  static List<UpdateCustomFieldDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateCustomFieldDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateCustomFieldDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateCustomFieldDto> mapFromJson(dynamic json) {
    final map = <String, UpdateCustomFieldDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateCustomFieldDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateCustomFieldDto-objects as value to a dart map
  static Map<String, List<UpdateCustomFieldDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateCustomFieldDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateCustomFieldDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


class UpdateCustomFieldDtoEntityEnum {
  /// Instantiate a new enum with the provided [value].
  const UpdateCustomFieldDtoEntityEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const employee = UpdateCustomFieldDtoEntityEnum._(r'employee');
  static const department = UpdateCustomFieldDtoEntityEnum._(r'department');
  static const task = UpdateCustomFieldDtoEntityEnum._(r'task');
  static const asset = UpdateCustomFieldDtoEntityEnum._(r'asset');
  static const document = UpdateCustomFieldDtoEntityEnum._(r'document');
  static const organization = UpdateCustomFieldDtoEntityEnum._(r'organization');
  static const leaveRequest = UpdateCustomFieldDtoEntityEnum._(r'leave_request');

  /// List of all possible values in this [enum][UpdateCustomFieldDtoEntityEnum].
  static const values = <UpdateCustomFieldDtoEntityEnum>[
    employee,
    department,
    task,
    asset,
    document,
    organization,
    leaveRequest,
  ];

  static UpdateCustomFieldDtoEntityEnum? fromJson(dynamic value) => UpdateCustomFieldDtoEntityEnumTypeTransformer().decode(value);

  static List<UpdateCustomFieldDtoEntityEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateCustomFieldDtoEntityEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateCustomFieldDtoEntityEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateCustomFieldDtoEntityEnum] to String,
/// and [decode] dynamic data back to [UpdateCustomFieldDtoEntityEnum].
class UpdateCustomFieldDtoEntityEnumTypeTransformer {
  factory UpdateCustomFieldDtoEntityEnumTypeTransformer() => _instance ??= const UpdateCustomFieldDtoEntityEnumTypeTransformer._();

  const UpdateCustomFieldDtoEntityEnumTypeTransformer._();

  String encode(UpdateCustomFieldDtoEntityEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a UpdateCustomFieldDtoEntityEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateCustomFieldDtoEntityEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'employee': return UpdateCustomFieldDtoEntityEnum.employee;
        case r'department': return UpdateCustomFieldDtoEntityEnum.department;
        case r'task': return UpdateCustomFieldDtoEntityEnum.task;
        case r'asset': return UpdateCustomFieldDtoEntityEnum.asset;
        case r'document': return UpdateCustomFieldDtoEntityEnum.document;
        case r'organization': return UpdateCustomFieldDtoEntityEnum.organization;
        case r'leave_request': return UpdateCustomFieldDtoEntityEnum.leaveRequest;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [UpdateCustomFieldDtoEntityEnumTypeTransformer] instance.
  static UpdateCustomFieldDtoEntityEnumTypeTransformer? _instance;
}



class UpdateCustomFieldDtoDataTypeEnum {
  /// Instantiate a new enum with the provided [value].
  const UpdateCustomFieldDtoDataTypeEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const text = UpdateCustomFieldDtoDataTypeEnum._(r'text');
  static const textarea = UpdateCustomFieldDtoDataTypeEnum._(r'textarea');
  static const number = UpdateCustomFieldDtoDataTypeEnum._(r'number');
  static const decimal = UpdateCustomFieldDtoDataTypeEnum._(r'decimal');
  static const boolean = UpdateCustomFieldDtoDataTypeEnum._(r'boolean');
  static const date = UpdateCustomFieldDtoDataTypeEnum._(r'date');
  static const datetime = UpdateCustomFieldDtoDataTypeEnum._(r'datetime');
  static const email = UpdateCustomFieldDtoDataTypeEnum._(r'email');
  static const phone = UpdateCustomFieldDtoDataTypeEnum._(r'phone');
  static const url = UpdateCustomFieldDtoDataTypeEnum._(r'url');
  static const select = UpdateCustomFieldDtoDataTypeEnum._(r'select');
  static const multiselect = UpdateCustomFieldDtoDataTypeEnum._(r'multiselect');
  static const file = UpdateCustomFieldDtoDataTypeEnum._(r'file');
  static const json = UpdateCustomFieldDtoDataTypeEnum._(r'json');

  /// List of all possible values in this [enum][UpdateCustomFieldDtoDataTypeEnum].
  static const values = <UpdateCustomFieldDtoDataTypeEnum>[
    text,
    textarea,
    number,
    decimal,
    boolean,
    date,
    datetime,
    email,
    phone,
    url,
    select,
    multiselect,
    file,
    json,
  ];

  static UpdateCustomFieldDtoDataTypeEnum? fromJson(dynamic value) => UpdateCustomFieldDtoDataTypeEnumTypeTransformer().decode(value);

  static List<UpdateCustomFieldDtoDataTypeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateCustomFieldDtoDataTypeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateCustomFieldDtoDataTypeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateCustomFieldDtoDataTypeEnum] to String,
/// and [decode] dynamic data back to [UpdateCustomFieldDtoDataTypeEnum].
class UpdateCustomFieldDtoDataTypeEnumTypeTransformer {
  factory UpdateCustomFieldDtoDataTypeEnumTypeTransformer() => _instance ??= const UpdateCustomFieldDtoDataTypeEnumTypeTransformer._();

  const UpdateCustomFieldDtoDataTypeEnumTypeTransformer._();

  String encode(UpdateCustomFieldDtoDataTypeEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a UpdateCustomFieldDtoDataTypeEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateCustomFieldDtoDataTypeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'text': return UpdateCustomFieldDtoDataTypeEnum.text;
        case r'textarea': return UpdateCustomFieldDtoDataTypeEnum.textarea;
        case r'number': return UpdateCustomFieldDtoDataTypeEnum.number;
        case r'decimal': return UpdateCustomFieldDtoDataTypeEnum.decimal;
        case r'boolean': return UpdateCustomFieldDtoDataTypeEnum.boolean;
        case r'date': return UpdateCustomFieldDtoDataTypeEnum.date;
        case r'datetime': return UpdateCustomFieldDtoDataTypeEnum.datetime;
        case r'email': return UpdateCustomFieldDtoDataTypeEnum.email;
        case r'phone': return UpdateCustomFieldDtoDataTypeEnum.phone;
        case r'url': return UpdateCustomFieldDtoDataTypeEnum.url;
        case r'select': return UpdateCustomFieldDtoDataTypeEnum.select;
        case r'multiselect': return UpdateCustomFieldDtoDataTypeEnum.multiselect;
        case r'file': return UpdateCustomFieldDtoDataTypeEnum.file;
        case r'json': return UpdateCustomFieldDtoDataTypeEnum.json;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [UpdateCustomFieldDtoDataTypeEnumTypeTransformer] instance.
  static UpdateCustomFieldDtoDataTypeEnumTypeTransformer? _instance;
}



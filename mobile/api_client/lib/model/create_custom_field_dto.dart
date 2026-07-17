//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CreateCustomFieldDto {
  /// Returns a new [CreateCustomFieldDto] instance.
  CreateCustomFieldDto({
    required this.entity,
    required this.fieldKey,
    required this.label,
    required this.dataType,
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

  CreateCustomFieldDtoEntityEnum entity;

  String fieldKey;

  String label;

  CreateCustomFieldDtoDataTypeEnum dataType;

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
  bool operator ==(Object other) => identical(this, other) || other is CreateCustomFieldDto &&
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
    (entity.hashCode) +
    (fieldKey.hashCode) +
    (label.hashCode) +
    (dataType.hashCode) +
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
  String toString() => 'CreateCustomFieldDto[entity=$entity, fieldKey=$fieldKey, label=$label, dataType=$dataType, helpText=$helpText, placeholder=$placeholder, isRequired=$isRequired, isUnique=$isUnique, isVisible=$isVisible, isSearchable=$isSearchable, isFilterable=$isFilterable, isEncrypted=$isEncrypted, minValue=$minValue, maxValue=$maxValue, minLength=$minLength, maxLength=$maxLength, regexPattern=$regexPattern, displayOrder=$displayOrder, options=$options]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'entity'] = this.entity;
      json[r'fieldKey'] = this.fieldKey;
      json[r'label'] = this.label;
      json[r'dataType'] = this.dataType;
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

  /// Returns a new [CreateCustomFieldDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CreateCustomFieldDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'entity'), 'Required key "CreateCustomFieldDto[entity]" is missing from JSON.');
        assert(json[r'entity'] != null, 'Required key "CreateCustomFieldDto[entity]" has a null value in JSON.');
        assert(json.containsKey(r'fieldKey'), 'Required key "CreateCustomFieldDto[fieldKey]" is missing from JSON.');
        assert(json[r'fieldKey'] != null, 'Required key "CreateCustomFieldDto[fieldKey]" has a null value in JSON.');
        assert(json.containsKey(r'label'), 'Required key "CreateCustomFieldDto[label]" is missing from JSON.');
        assert(json[r'label'] != null, 'Required key "CreateCustomFieldDto[label]" has a null value in JSON.');
        assert(json.containsKey(r'dataType'), 'Required key "CreateCustomFieldDto[dataType]" is missing from JSON.');
        assert(json[r'dataType'] != null, 'Required key "CreateCustomFieldDto[dataType]" has a null value in JSON.');
        return true;
      }());

      return CreateCustomFieldDto(
        entity: CreateCustomFieldDtoEntityEnum.fromJson(json[r'entity'])!,
        fieldKey: mapValueOfType<String>(json, r'fieldKey')!,
        label: mapValueOfType<String>(json, r'label')!,
        dataType: CreateCustomFieldDtoDataTypeEnum.fromJson(json[r'dataType'])!,
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

  static List<CreateCustomFieldDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateCustomFieldDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateCustomFieldDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CreateCustomFieldDto> mapFromJson(dynamic json) {
    final map = <String, CreateCustomFieldDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CreateCustomFieldDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CreateCustomFieldDto-objects as value to a dart map
  static Map<String, List<CreateCustomFieldDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CreateCustomFieldDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CreateCustomFieldDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'entity',
    'fieldKey',
    'label',
    'dataType',
  };
}


class CreateCustomFieldDtoEntityEnum {
  /// Instantiate a new enum with the provided [value].
  const CreateCustomFieldDtoEntityEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const employee = CreateCustomFieldDtoEntityEnum._(r'employee');
  static const department = CreateCustomFieldDtoEntityEnum._(r'department');
  static const task = CreateCustomFieldDtoEntityEnum._(r'task');
  static const asset = CreateCustomFieldDtoEntityEnum._(r'asset');
  static const document = CreateCustomFieldDtoEntityEnum._(r'document');
  static const organization = CreateCustomFieldDtoEntityEnum._(r'organization');
  static const leaveRequest = CreateCustomFieldDtoEntityEnum._(r'leave_request');

  /// List of all possible values in this [enum][CreateCustomFieldDtoEntityEnum].
  static const values = <CreateCustomFieldDtoEntityEnum>[
    employee,
    department,
    task,
    asset,
    document,
    organization,
    leaveRequest,
  ];

  static CreateCustomFieldDtoEntityEnum? fromJson(dynamic value) => CreateCustomFieldDtoEntityEnumTypeTransformer().decode(value);

  static List<CreateCustomFieldDtoEntityEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateCustomFieldDtoEntityEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateCustomFieldDtoEntityEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [CreateCustomFieldDtoEntityEnum] to String,
/// and [decode] dynamic data back to [CreateCustomFieldDtoEntityEnum].
class CreateCustomFieldDtoEntityEnumTypeTransformer {
  factory CreateCustomFieldDtoEntityEnumTypeTransformer() => _instance ??= const CreateCustomFieldDtoEntityEnumTypeTransformer._();

  const CreateCustomFieldDtoEntityEnumTypeTransformer._();

  String encode(CreateCustomFieldDtoEntityEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a CreateCustomFieldDtoEntityEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  CreateCustomFieldDtoEntityEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'employee': return CreateCustomFieldDtoEntityEnum.employee;
        case r'department': return CreateCustomFieldDtoEntityEnum.department;
        case r'task': return CreateCustomFieldDtoEntityEnum.task;
        case r'asset': return CreateCustomFieldDtoEntityEnum.asset;
        case r'document': return CreateCustomFieldDtoEntityEnum.document;
        case r'organization': return CreateCustomFieldDtoEntityEnum.organization;
        case r'leave_request': return CreateCustomFieldDtoEntityEnum.leaveRequest;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [CreateCustomFieldDtoEntityEnumTypeTransformer] instance.
  static CreateCustomFieldDtoEntityEnumTypeTransformer? _instance;
}



class CreateCustomFieldDtoDataTypeEnum {
  /// Instantiate a new enum with the provided [value].
  const CreateCustomFieldDtoDataTypeEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const text = CreateCustomFieldDtoDataTypeEnum._(r'text');
  static const textarea = CreateCustomFieldDtoDataTypeEnum._(r'textarea');
  static const number = CreateCustomFieldDtoDataTypeEnum._(r'number');
  static const decimal = CreateCustomFieldDtoDataTypeEnum._(r'decimal');
  static const boolean = CreateCustomFieldDtoDataTypeEnum._(r'boolean');
  static const date = CreateCustomFieldDtoDataTypeEnum._(r'date');
  static const datetime = CreateCustomFieldDtoDataTypeEnum._(r'datetime');
  static const email = CreateCustomFieldDtoDataTypeEnum._(r'email');
  static const phone = CreateCustomFieldDtoDataTypeEnum._(r'phone');
  static const url = CreateCustomFieldDtoDataTypeEnum._(r'url');
  static const select = CreateCustomFieldDtoDataTypeEnum._(r'select');
  static const multiselect = CreateCustomFieldDtoDataTypeEnum._(r'multiselect');
  static const file = CreateCustomFieldDtoDataTypeEnum._(r'file');
  static const json = CreateCustomFieldDtoDataTypeEnum._(r'json');

  /// List of all possible values in this [enum][CreateCustomFieldDtoDataTypeEnum].
  static const values = <CreateCustomFieldDtoDataTypeEnum>[
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

  static CreateCustomFieldDtoDataTypeEnum? fromJson(dynamic value) => CreateCustomFieldDtoDataTypeEnumTypeTransformer().decode(value);

  static List<CreateCustomFieldDtoDataTypeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateCustomFieldDtoDataTypeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateCustomFieldDtoDataTypeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [CreateCustomFieldDtoDataTypeEnum] to String,
/// and [decode] dynamic data back to [CreateCustomFieldDtoDataTypeEnum].
class CreateCustomFieldDtoDataTypeEnumTypeTransformer {
  factory CreateCustomFieldDtoDataTypeEnumTypeTransformer() => _instance ??= const CreateCustomFieldDtoDataTypeEnumTypeTransformer._();

  const CreateCustomFieldDtoDataTypeEnumTypeTransformer._();

  String encode(CreateCustomFieldDtoDataTypeEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a CreateCustomFieldDtoDataTypeEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  CreateCustomFieldDtoDataTypeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'text': return CreateCustomFieldDtoDataTypeEnum.text;
        case r'textarea': return CreateCustomFieldDtoDataTypeEnum.textarea;
        case r'number': return CreateCustomFieldDtoDataTypeEnum.number;
        case r'decimal': return CreateCustomFieldDtoDataTypeEnum.decimal;
        case r'boolean': return CreateCustomFieldDtoDataTypeEnum.boolean;
        case r'date': return CreateCustomFieldDtoDataTypeEnum.date;
        case r'datetime': return CreateCustomFieldDtoDataTypeEnum.datetime;
        case r'email': return CreateCustomFieldDtoDataTypeEnum.email;
        case r'phone': return CreateCustomFieldDtoDataTypeEnum.phone;
        case r'url': return CreateCustomFieldDtoDataTypeEnum.url;
        case r'select': return CreateCustomFieldDtoDataTypeEnum.select;
        case r'multiselect': return CreateCustomFieldDtoDataTypeEnum.multiselect;
        case r'file': return CreateCustomFieldDtoDataTypeEnum.file;
        case r'json': return CreateCustomFieldDtoDataTypeEnum.json;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [CreateCustomFieldDtoDataTypeEnumTypeTransformer] instance.
  static CreateCustomFieldDtoDataTypeEnumTypeTransformer? _instance;
}



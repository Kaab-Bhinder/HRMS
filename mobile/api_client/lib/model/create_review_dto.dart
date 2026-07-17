//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CreateReviewDto {
  /// Returns a new [CreateReviewDto] instance.
  CreateReviewDto({
    required this.employeeId,
    this.cycleId,
    this.reviewerId,
    this.status,
    this.overallScore,
    this.summary,
  });

  String employeeId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? cycleId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? reviewerId;

  CreateReviewDtoStatusEnum? status;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? overallScore;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? summary;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CreateReviewDto &&
    other.employeeId == employeeId &&
    other.cycleId == cycleId &&
    other.reviewerId == reviewerId &&
    other.status == status &&
    other.overallScore == overallScore &&
    other.summary == summary;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (employeeId.hashCode) +
    (cycleId == null ? 0 : cycleId!.hashCode) +
    (reviewerId == null ? 0 : reviewerId!.hashCode) +
    (status == null ? 0 : status!.hashCode) +
    (overallScore == null ? 0 : overallScore!.hashCode) +
    (summary == null ? 0 : summary!.hashCode);

  @override
  String toString() => 'CreateReviewDto[employeeId=$employeeId, cycleId=$cycleId, reviewerId=$reviewerId, status=$status, overallScore=$overallScore, summary=$summary]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'employeeId'] = this.employeeId;
    if (this.cycleId != null) {
      json[r'cycleId'] = this.cycleId;
    } else {
      json[r'cycleId'] = null;
    }
    if (this.reviewerId != null) {
      json[r'reviewerId'] = this.reviewerId;
    } else {
      json[r'reviewerId'] = null;
    }
    if (this.status != null) {
      json[r'status'] = this.status;
    } else {
      json[r'status'] = null;
    }
    if (this.overallScore != null) {
      json[r'overallScore'] = this.overallScore;
    } else {
      json[r'overallScore'] = null;
    }
    if (this.summary != null) {
      json[r'summary'] = this.summary;
    } else {
      json[r'summary'] = null;
    }
    return json;
  }

  /// Returns a new [CreateReviewDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CreateReviewDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'employeeId'), 'Required key "CreateReviewDto[employeeId]" is missing from JSON.');
        assert(json[r'employeeId'] != null, 'Required key "CreateReviewDto[employeeId]" has a null value in JSON.');
        return true;
      }());

      return CreateReviewDto(
        employeeId: mapValueOfType<String>(json, r'employeeId')!,
        cycleId: mapValueOfType<String>(json, r'cycleId'),
        reviewerId: mapValueOfType<String>(json, r'reviewerId'),
        status: CreateReviewDtoStatusEnum.fromJson(json[r'status']),
        overallScore: num.parse('${json[r'overallScore']}'),
        summary: mapValueOfType<String>(json, r'summary'),
      );
    }
    return null;
  }

  static List<CreateReviewDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateReviewDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateReviewDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CreateReviewDto> mapFromJson(dynamic json) {
    final map = <String, CreateReviewDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CreateReviewDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CreateReviewDto-objects as value to a dart map
  static Map<String, List<CreateReviewDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CreateReviewDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CreateReviewDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'employeeId',
  };
}


class CreateReviewDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const CreateReviewDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const draft = CreateReviewDtoStatusEnum._(r'draft');
  static const inProgress = CreateReviewDtoStatusEnum._(r'in_progress');
  static const submitted = CreateReviewDtoStatusEnum._(r'submitted');
  static const acknowledged = CreateReviewDtoStatusEnum._(r'acknowledged');
  static const closed = CreateReviewDtoStatusEnum._(r'closed');

  /// List of all possible values in this [enum][CreateReviewDtoStatusEnum].
  static const values = <CreateReviewDtoStatusEnum>[
    draft,
    inProgress,
    submitted,
    acknowledged,
    closed,
  ];

  static CreateReviewDtoStatusEnum? fromJson(dynamic value) => CreateReviewDtoStatusEnumTypeTransformer().decode(value);

  static List<CreateReviewDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CreateReviewDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CreateReviewDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [CreateReviewDtoStatusEnum] to String,
/// and [decode] dynamic data back to [CreateReviewDtoStatusEnum].
class CreateReviewDtoStatusEnumTypeTransformer {
  factory CreateReviewDtoStatusEnumTypeTransformer() => _instance ??= const CreateReviewDtoStatusEnumTypeTransformer._();

  const CreateReviewDtoStatusEnumTypeTransformer._();

  String encode(CreateReviewDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a CreateReviewDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  CreateReviewDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'draft': return CreateReviewDtoStatusEnum.draft;
        case r'in_progress': return CreateReviewDtoStatusEnum.inProgress;
        case r'submitted': return CreateReviewDtoStatusEnum.submitted;
        case r'acknowledged': return CreateReviewDtoStatusEnum.acknowledged;
        case r'closed': return CreateReviewDtoStatusEnum.closed;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [CreateReviewDtoStatusEnumTypeTransformer] instance.
  static CreateReviewDtoStatusEnumTypeTransformer? _instance;
}



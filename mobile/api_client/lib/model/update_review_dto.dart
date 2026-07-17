//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UpdateReviewDto {
  /// Returns a new [UpdateReviewDto] instance.
  UpdateReviewDto({
    this.employeeId,
    this.cycleId,
    this.reviewerId,
    this.status,
    this.overallScore,
    this.summary,
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? employeeId;

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

  UpdateReviewDtoStatusEnum? status;

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
  bool operator ==(Object other) => identical(this, other) || other is UpdateReviewDto &&
    other.employeeId == employeeId &&
    other.cycleId == cycleId &&
    other.reviewerId == reviewerId &&
    other.status == status &&
    other.overallScore == overallScore &&
    other.summary == summary;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (employeeId == null ? 0 : employeeId!.hashCode) +
    (cycleId == null ? 0 : cycleId!.hashCode) +
    (reviewerId == null ? 0 : reviewerId!.hashCode) +
    (status == null ? 0 : status!.hashCode) +
    (overallScore == null ? 0 : overallScore!.hashCode) +
    (summary == null ? 0 : summary!.hashCode);

  @override
  String toString() => 'UpdateReviewDto[employeeId=$employeeId, cycleId=$cycleId, reviewerId=$reviewerId, status=$status, overallScore=$overallScore, summary=$summary]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.employeeId != null) {
      json[r'employeeId'] = this.employeeId;
    } else {
      json[r'employeeId'] = null;
    }
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

  /// Returns a new [UpdateReviewDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateReviewDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return UpdateReviewDto(
        employeeId: mapValueOfType<String>(json, r'employeeId'),
        cycleId: mapValueOfType<String>(json, r'cycleId'),
        reviewerId: mapValueOfType<String>(json, r'reviewerId'),
        status: UpdateReviewDtoStatusEnum.fromJson(json[r'status']),
        overallScore: num.parse('${json[r'overallScore']}'),
        summary: mapValueOfType<String>(json, r'summary'),
      );
    }
    return null;
  }

  static List<UpdateReviewDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateReviewDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateReviewDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateReviewDto> mapFromJson(dynamic json) {
    final map = <String, UpdateReviewDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateReviewDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateReviewDto-objects as value to a dart map
  static Map<String, List<UpdateReviewDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateReviewDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateReviewDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


class UpdateReviewDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const UpdateReviewDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const draft = UpdateReviewDtoStatusEnum._(r'draft');
  static const inProgress = UpdateReviewDtoStatusEnum._(r'in_progress');
  static const submitted = UpdateReviewDtoStatusEnum._(r'submitted');
  static const acknowledged = UpdateReviewDtoStatusEnum._(r'acknowledged');
  static const closed = UpdateReviewDtoStatusEnum._(r'closed');

  /// List of all possible values in this [enum][UpdateReviewDtoStatusEnum].
  static const values = <UpdateReviewDtoStatusEnum>[
    draft,
    inProgress,
    submitted,
    acknowledged,
    closed,
  ];

  static UpdateReviewDtoStatusEnum? fromJson(dynamic value) => UpdateReviewDtoStatusEnumTypeTransformer().decode(value);

  static List<UpdateReviewDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateReviewDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateReviewDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateReviewDtoStatusEnum] to String,
/// and [decode] dynamic data back to [UpdateReviewDtoStatusEnum].
class UpdateReviewDtoStatusEnumTypeTransformer {
  factory UpdateReviewDtoStatusEnumTypeTransformer() => _instance ??= const UpdateReviewDtoStatusEnumTypeTransformer._();

  const UpdateReviewDtoStatusEnumTypeTransformer._();

  String encode(UpdateReviewDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a UpdateReviewDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateReviewDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'draft': return UpdateReviewDtoStatusEnum.draft;
        case r'in_progress': return UpdateReviewDtoStatusEnum.inProgress;
        case r'submitted': return UpdateReviewDtoStatusEnum.submitted;
        case r'acknowledged': return UpdateReviewDtoStatusEnum.acknowledged;
        case r'closed': return UpdateReviewDtoStatusEnum.closed;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [UpdateReviewDtoStatusEnumTypeTransformer] instance.
  static UpdateReviewDtoStatusEnumTypeTransformer? _instance;
}



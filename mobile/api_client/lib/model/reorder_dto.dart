//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ReorderDto {
  /// Returns a new [ReorderDto] instance.
  ReorderDto({
    this.orderedIds = const [],
  });

  List<String> orderedIds;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ReorderDto &&
    _deepEquality.equals(other.orderedIds, orderedIds);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (orderedIds.hashCode);

  @override
  String toString() => 'ReorderDto[orderedIds=$orderedIds]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'orderedIds'] = this.orderedIds;
    return json;
  }

  /// Returns a new [ReorderDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ReorderDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'orderedIds'), 'Required key "ReorderDto[orderedIds]" is missing from JSON.');
        assert(json[r'orderedIds'] != null, 'Required key "ReorderDto[orderedIds]" has a null value in JSON.');
        return true;
      }());

      return ReorderDto(
        orderedIds: json[r'orderedIds'] is Iterable
            ? (json[r'orderedIds'] as Iterable).cast<String>().toList(growable: false)
            : const [],
      );
    }
    return null;
  }

  static List<ReorderDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ReorderDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ReorderDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ReorderDto> mapFromJson(dynamic json) {
    final map = <String, ReorderDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ReorderDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ReorderDto-objects as value to a dart map
  static Map<String, List<ReorderDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ReorderDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ReorderDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'orderedIds',
  };
}


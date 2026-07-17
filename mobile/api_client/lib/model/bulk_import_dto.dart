//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class BulkImportDto {
  /// Returns a new [BulkImportDto] instance.
  BulkImportDto({
    this.rows = const [],
  });

  List<CreateEmployeeDto> rows;

  @override
  bool operator ==(Object other) => identical(this, other) || other is BulkImportDto &&
    _deepEquality.equals(other.rows, rows);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (rows.hashCode);

  @override
  String toString() => 'BulkImportDto[rows=$rows]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'rows'] = this.rows;
    return json;
  }

  /// Returns a new [BulkImportDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static BulkImportDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'rows'), 'Required key "BulkImportDto[rows]" is missing from JSON.');
        assert(json[r'rows'] != null, 'Required key "BulkImportDto[rows]" has a null value in JSON.');
        return true;
      }());

      return BulkImportDto(
        rows: CreateEmployeeDto.listFromJson(json[r'rows']),
      );
    }
    return null;
  }

  static List<BulkImportDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <BulkImportDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = BulkImportDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, BulkImportDto> mapFromJson(dynamic json) {
    final map = <String, BulkImportDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = BulkImportDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of BulkImportDto-objects as value to a dart map
  static Map<String, List<BulkImportDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<BulkImportDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = BulkImportDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'rows',
  };
}


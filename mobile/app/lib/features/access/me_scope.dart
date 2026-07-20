/// The caller's role-based view descriptor from `GET /me/scope`.
class DeptRef {
  const DeptRef(this.id, this.name);
  final String id;
  final String name;
}

class MeScope {
  const MeScope({
    required this.view,
    this.employeeId,
    this.headsDepartments = const [],
    this.departmentName,
    this.departmentHeadName,
    this.departmentHeadEmail,
  });

  final String view; // admin | hr | dept_head | employee
  final String? employeeId;

  /// Departments this user HEADS (empty unless [isDeptHead]).
  final List<DeptRef> headsDepartments;

  /// The department this user BELONGS to, and who leads it.
  final String? departmentName;
  final String? departmentHeadName;
  final String? departmentHeadEmail;

  bool get isDeptHead => view == 'dept_head';
  bool get isEmployee => view == 'employee';
  String? get primaryDepartment => headsDepartments.isNotEmpty ? headsDepartments.first.name : null;

  /// True when this user reports to somebody other than themselves — used to
  /// decide whether to show the "your department head" card.
  bool get hasDepartmentHead => (departmentHeadName ?? '').isNotEmpty && !isDeptHead;

  static MeScope fromJson(Map<String, dynamic> j) => MeScope(
        view: j['view']?.toString() ?? 'employee',
        employeeId: j['employeeId']?.toString(),
        headsDepartments: (j['headsDepartments'] as List?)
                ?.map((e) => DeptRef((e['id']).toString(), (e['name']).toString()))
                .toList() ??
            const [],
        departmentName: j['departmentName']?.toString(),
        departmentHeadName: j['departmentHeadName']?.toString(),
        departmentHeadEmail: j['departmentHeadEmail']?.toString(),
      );
}

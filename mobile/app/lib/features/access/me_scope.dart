/// The caller's role-based view descriptor from `GET /me/scope`.
class DeptRef {
  const DeptRef(this.id, this.name);
  final String id;
  final String name;
}

class MeScope {
  const MeScope({required this.view, this.employeeId, this.headsDepartments = const []});

  final String view; // admin | hr | dept_head | employee
  final String? employeeId;
  final List<DeptRef> headsDepartments;

  bool get isDeptHead => view == 'dept_head';
  bool get isEmployee => view == 'employee';
  String? get primaryDepartment => headsDepartments.isNotEmpty ? headsDepartments.first.name : null;

  static MeScope fromJson(Map<String, dynamic> j) => MeScope(
        view: j['view']?.toString() ?? 'employee',
        employeeId: j['employeeId']?.toString(),
        headsDepartments: (j['headsDepartments'] as List?)
                ?.map((e) => DeptRef((e['id']).toString(), (e['name']).toString()))
                .toList() ??
            const [],
      );
}

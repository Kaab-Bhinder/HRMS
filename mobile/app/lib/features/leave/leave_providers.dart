import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/di/providers.dart';
import '../access/access_providers.dart';
import '../../core/network/json_num.dart';

/// A leave type the employee can apply against (Annual, Sick, ...).
class LeaveType {
  const LeaveType({required this.id, required this.name, this.isPaid = true});
  final String id;
  final String name;
  final bool isPaid;

  static LeaveType fromJson(Map<String, dynamic> j) => LeaveType(
        id: j['id'].toString(),
        name: j['name']?.toString() ?? 'Leave',
        isPaid: j['isPaid'] as bool? ?? true,
      );
}

/// One of the employee's own leave requests, with its approval state.
class LeaveRequest {
  const LeaveRequest({
    required this.id,
    required this.leaveType,
    required this.startDate,
    required this.endDate,
    required this.days,
    required this.status,
    this.reason,
    this.decidedAt,
  });

  final String id;
  final String leaveType;
  final DateTime startDate;
  final DateTime endDate;
  final double days;

  /// pending | approved | rejected | cancelled
  final String status;
  final String? reason;
  final DateTime? decidedAt;

  bool get isPending => status == 'pending';
  bool get isApproved => status == 'approved';
  bool get isRejected => status == 'rejected';

  static LeaveRequest fromJson(Map<String, dynamic> j) {
    DateTime dt(dynamic v) => DateTime.tryParse(v?.toString() ?? '')?.toLocal() ?? DateTime.now();
    return LeaveRequest(
      id: j['id'].toString(),
      leaveType: (j['leaveType'] ?? j['leaveTypeName'] ?? 'Leave').toString(),
      startDate: dt(j['startDate']),
      endDate: dt(j['endDate']),
      days: asDouble(j['days'], 0),
      status: j['status']?.toString() ?? 'pending',
      reason: j['reason']?.toString(),
      decidedAt: j['decidedAt'] == null ? null : dt(j['decidedAt']),
    );
  }
}

/// This year's allowance for one leave type.
///
/// [allotted] is null for an ADDITIONAL type (Sick): it does not draw on the
/// annual allowance, so there is nothing to count down and [remaining] is null.
/// Annual is ALLOTTED — the super admin sets the number in the web dashboard
/// (Attendance Settings), and requests beyond it are refused by the API.
///
/// [remaining] is deducted on APPROVAL only, so it is the honest "days you still
/// own" figure to put in front of the employee. [available] additionally holds
/// back days already awaiting a decision and is what the API validates against,
/// so the apply form must use it or it would promise days it will then refuse.
class LeaveBalance {
  const LeaveBalance({
    required this.leaveTypeId,
    required this.leaveType,
    required this.allotted,
    required this.taken,
    required this.pending,
    required this.remaining,
    required this.available,
  });

  final String leaveTypeId;
  final String leaveType;
  final double? allotted;
  final double taken;
  final double pending;
  final double? remaining;
  final double? available;

  bool get isAdditional => allotted == null;

  static double _d(dynamic v) => asDouble(v, 0);

  static LeaveBalance fromJson(Map<String, dynamic> j) => LeaveBalance(
        leaveTypeId: j['leaveTypeId'].toString(),
        leaveType: j['leaveType']?.toString() ?? 'Leave',
        allotted: j['allotted'] == null ? null : _d(j['allotted']),
        taken: _d(j['taken']),
        pending: _d(j['pending']),
        remaining: j['remaining'] == null ? null : _d(j['remaining']),
        available: j['available'] == null ? null : _d(j['available']),
      );
}

/// The signed-in employee's own leave balances for this year.
final myLeaveBalancesProvider = FutureProvider<List<LeaveBalance>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final scope = await ref.watch(meScopeProvider.future);
  final employeeId = scope.employeeId;
  if (employeeId == null) return const [];
  final data = await api.get('/leave/balances/$employeeId');
  final rows = (data is List) ? data : const [];
  return rows.map((e) => LeaveBalance.fromJson((e as Map).cast<String, dynamic>())).toList();
});

/// Leave types available to apply for.
final leaveTypesProvider = FutureProvider<List<LeaveType>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final data = await api.get('/leave/types');
  final rows = (data is List) ? data : const [];
  return rows.map((e) => LeaveType.fromJson((e as Map).cast<String, dynamic>())).toList();
});

/// The signed-in employee's own leave requests. The endpoint is role-scoped, so
/// an employee automatically receives only their own.
final myLeaveProvider = FutureProvider<List<LeaveRequest>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final env = await api.getEnvelope('/leave/requests', query: {'limit': '50'});
  final rows = (env.data is List) ? env.data as List : const [];
  final list = rows.map((e) => LeaveRequest.fromJson((e as Map).cast<String, dynamic>())).toList();
  list.sort((a, b) => b.startDate.compareTo(a.startDate)); // newest first
  return list;
});

/// Actions an employee can take on their own leave.
class LeaveActions {
  LeaveActions(this._ref);
  final Ref _ref;

  /// Submit a new request. The API resolves the employee from the token, so no
  /// employeeId is sent — an employee can only ever apply for themselves.
  Future<void> apply({
    required String leaveTypeId,
    required DateTime start,
    required DateTime end,
    String? reason,
  }) async {
    String d(DateTime x) =>
        '${x.year}-${x.month.toString().padLeft(2, '0')}-${x.day.toString().padLeft(2, '0')}';
    await _ref.read(apiClientProvider).post('/leave/requests', body: {
      'leaveTypeId': leaveTypeId,
      'startDate': d(start),
      'endDate': d(end),
      'reason': ?reason,
    });
    _ref.invalidate(myLeaveProvider);
    _ref.invalidate(myLeaveBalancesProvider); // remaining days changed
  }

  /// Withdraw a request that has not been decided yet.
  Future<void> cancel(String id) async {
    await _ref.read(apiClientProvider).post('/leave/requests/$id/cancel');
    _ref.invalidate(myLeaveProvider);
    _ref.invalidate(myLeaveBalancesProvider); // remaining days changed
  }
}

final leaveActionsProvider = Provider<LeaveActions>((ref) => LeaveActions(ref));

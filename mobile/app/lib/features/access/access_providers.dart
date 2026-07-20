import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/di/providers.dart';
import 'me_scope.dart';
import '../../core/network/json_num.dart';

/// The signed-in user's role view (admin / hr / dept_head / employee).
final meScopeProvider = FutureProvider<MeScope>((ref) async {
  final api = ref.watch(apiClientProvider);
  final data = await api.get('/me/scope') as Map<String, dynamic>;
  return MeScope.fromJson(data);
});

/// At-a-glance counts for a department head's team. Uses the role-scoped list
/// endpoints (each returns only the head's team), reading `meta.total`.
class TeamSummary {
  const TeamSummary({required this.members, required this.pendingApprovals, required this.openTasks});
  final int members;
  final int pendingApprovals;
  final int openTasks;
}

final teamSummaryProvider = FutureProvider<TeamSummary>((ref) async {
  final api = ref.watch(apiClientProvider);
  Future<int> total(String path) async {
    final env = await api.getEnvelope(path);
    return asInt(env.meta?['total'], 0);
  }

  final results = await Future.wait([
    total('/employees?limit=1'),
    total('/leave/requests?status=pending&limit=1'),
    total('/tasks?status=in_progress&limit=1'),
  ]);
  return TeamSummary(members: results[0], pendingApprovals: results[1], openTasks: results[2]);
});

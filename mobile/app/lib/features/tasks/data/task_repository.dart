import '../../../core/network/api_client.dart';
import '../domain/task_item.dart';
import '../../../core/network/json_num.dart';

class TaskRepository {
  TaskRepository(this._api);
  final ApiClient _api;

  Future<List<TaskItem>> getTasks() async {
    final data = await _api.get('/tasks?limit=100&sort=dueDate&order=asc') as List;
    return data.map((e) => _fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> updateStatus(String id, String status) async {
    await _api.patch('/tasks/$id/status', body: {'status': status});
  }

  TaskItem _fromJson(Map<String, dynamic> j) {
    return TaskItem(
      id: j['id'].toString(),
      title: j['title']?.toString() ?? '',
      status: j['status']?.toString() ?? 'todo',
      priority: j['priority']?.toString() ?? 'medium',
      progress: asInt(j['progress'], 0),
      description: j['description']?.toString(),
      departmentName: j['departmentName']?.toString(),
      dueDate: j['dueDate'] == null ? null : DateTime.tryParse(j['dueDate'].toString())?.toLocal(),
      assignees: (j['assignees'] as List?)?.map((a) => (a['name'] ?? '').toString()).toList() ?? const [],
    );
  }
}

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

  /// Full detail for one task. The list endpoint omits `assignedByName`, which
  /// the API only resolves per-task, so the detail sheet re-fetches on open.
  Future<TaskItem> getOne(String id) async {
    final data = await _api.get('/tasks/$id') as Map<String, dynamic>;
    return _fromJson(data);
  }

  Future<void> updateStatus(String id, String status) async {
    await _api.patch('/tasks/$id/status', body: {'status': status});
  }

  /// Report back on an assigned task.
  ///
  /// [markComplete] moves the task to `in_review`, not `done` — the department
  /// head confirms completion. Attachments are uploaded separately first, so
  /// they already exist when the note lands in the head's inbox.
  Future<TaskSubmission> submit(String id, {required String note, bool markComplete = false}) async {
    final data = await _api.post('/tasks/$id/submit', body: {
      'note': note,
      'markComplete': markComplete,
    }) as Map<String, dynamic>;
    return TaskSubmission(
      status: data['status']?.toString() ?? 'in_review',
      attachments: asInt(data['attachments'], 0),
    );
  }

  /// Attaches a document/photo to a task. The API scopes this to the assignee.
  Future<void> attach(String taskId, List<int> bytes, {required String filename, required String contentType}) async {
    await _api.uploadBytes(
      '/files/upload',
      bytes,
      filename: filename,
      contentType: contentType,
      fields: {'ownerType': 'task', 'ownerId': taskId},
    );
  }

  Future<List<TaskAttachment>> attachments(String taskId) async {
    final data = await _api.get('/files?ownerType=task&ownerId=$taskId');
    final rows = data is List ? data : const [];
    return rows
        .map((e) => TaskAttachment.fromJson((e as Map).cast<String, dynamic>()))
        .toList();
  }

  Future<List<TaskUpdate>> comments(String taskId) async {
    final data = await _api.get('/tasks/$taskId/comments');
    final rows = data is List ? data : const [];
    return rows.map((e) => TaskUpdate.fromJson((e as Map).cast<String, dynamic>())).toList();
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
      assignedByName: j['assignedByName']?.toString(),
    );
  }
}

/// Result of reporting back on a task.
class TaskSubmission {
  const TaskSubmission({required this.status, required this.attachments});
  final String status;
  final int attachments;
}

class TaskAttachment {
  const TaskAttachment({required this.id, required this.fileName, required this.sizeBytes});
  final String id;
  final String fileName;
  final int sizeBytes;

  static TaskAttachment fromJson(Map<String, dynamic> j) => TaskAttachment(
        id: j['id'].toString(),
        fileName: j['fileName']?.toString() ?? 'file',
        sizeBytes: asInt(j['sizeBytes'], 0),
      );
}

/// A note on the task thread — the employee's report or the head's reply.
class TaskUpdate {
  const TaskUpdate({required this.id, required this.body, required this.createdAt, this.authorName});
  final String id;
  final String body;
  final DateTime createdAt;
  final String? authorName;

  static TaskUpdate fromJson(Map<String, dynamic> j) => TaskUpdate(
        id: j['id'].toString(),
        body: j['body']?.toString() ?? '',
        authorName: j['authorName']?.toString(),
        createdAt: DateTime.tryParse(j['createdAt']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
      );
}

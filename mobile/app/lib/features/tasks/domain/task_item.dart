/// A task as the employee sees it (mirrors `GET /tasks` serialized shape).
class TaskItem {
  const TaskItem({
    required this.id,
    required this.title,
    required this.status,
    required this.priority,
    required this.progress,
    this.description,
    this.departmentName,
    this.dueDate,
    this.assignees = const [],
  });

  final String id;
  final String title;
  final String status; // backlog|todo|in_progress|in_review|blocked|done|cancelled
  final String priority; // low|medium|high|urgent
  final int progress;
  final String? description;
  final String? departmentName;
  final DateTime? dueDate;
  final List<String> assignees;

  bool get isDone => status == 'done';
  bool get isOpen => status != 'done' && status != 'cancelled';
}

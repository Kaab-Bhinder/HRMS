import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/di/providers.dart';
import '../data/task_repository.dart';
import '../domain/task_item.dart';

final taskRepositoryProvider = Provider<TaskRepository>((ref) {
  return TaskRepository(ref.watch(apiClientProvider));
});

/// Loads the employee's assigned tasks (role-scoped server-side) and lets them
/// move a task's status forward.
class TasksController extends AsyncNotifier<List<TaskItem>> {
  TaskRepository get _repo => ref.read(taskRepositoryProvider);

  @override
  Future<List<TaskItem>> build() => _repo.getTasks();

  Future<void> refresh() async {
    state = await AsyncValue.guard(() => _repo.getTasks());
  }

  Future<void> setStatus(String id, String status) async {
    await _repo.updateStatus(id, status);
    state = AsyncData(await _repo.getTasks());
  }
}

final tasksControllerProvider = AsyncNotifierProvider<TasksController, List<TaskItem>>(TasksController.new);

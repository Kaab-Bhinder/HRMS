import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_snackbar.dart';
import '../../../core/widgets/app_states.dart';
import '../../../core/widgets/hero_surface.dart';
import '../../../core/widgets/skeleton.dart';
import '../../../core/widgets/status_pill.dart';
import '../domain/task_item.dart';
import 'task_ui.dart';
import 'tasks_controller.dart';

class TasksScreen extends ConsumerStatefulWidget {
  const TasksScreen({super.key});

  @override
  ConsumerState<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends ConsumerState<TasksScreen> {
  String _filter = 'open'; // open | all | done

  List<TaskItem> _apply(List<TaskItem> tasks) {
    switch (_filter) {
      case 'done':
        return tasks.where((t) => t.isDone).toList();
      case 'all':
        return tasks;
      default:
        return tasks.where((t) => t.isOpen).toList();
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final async = ref.watch(tasksControllerProvider);

    return AmbientBackground(
      child: SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.screen, AppSpacing.lg, AppSpacing.screen, AppSpacing.md),
            child: Row(
              children: [
                Text('My tasks', style: context.text.headlineMedium),
                const Spacer(),
                _FilterChips(value: _filter, onChanged: (v) => setState(() => _filter = v)),
              ],
            ),
          ),
          // At-a-glance analytics for the tasks assigned to this employee,
          // derived from the already-loaded list (no extra request).
          async.maybeWhen(
            data: (all) => Padding(
              padding: const EdgeInsets.fromLTRB(AppSpacing.screen, 0, AppSpacing.screen, AppSpacing.xl),
              child: _TasksHero(tasks: all),
            ),
            orElse: () => const SizedBox.shrink(),
          ),
          Expanded(
            child: RefreshIndicator(
              color: c.primary,
              backgroundColor: c.surface,
              onRefresh: () => ref.read(tasksControllerProvider.notifier).refresh(),
              child: async.when(
                loading: () => ListView(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screen),
                  children: List.generate(4, (_) => const Padding(padding: EdgeInsets.only(bottom: AppSpacing.md), child: AppCard(child: Skeleton(height: 64)))),
                ),
                error: (e, _) => ListView(
                  children: [
                    const SizedBox(height: 80),
                    ErrorStateView(message: e is ApiException ? e.message : 'Couldn’t load your tasks.', onRetry: () => ref.read(tasksControllerProvider.notifier).refresh()),
                  ],
                ),
                data: (tasks) {
                  final list = _apply(tasks);
                  if (list.isEmpty) {
                    return ListView(children: [
                      const SizedBox(height: 60),
                      EmptyState(
                        icon: Icons.checklist_rounded,
                        title: _filter == 'done' ? 'Nothing completed yet' : 'No tasks assigned',
                        message: _filter == 'done' ? 'Completed tasks will show here.' : 'Tasks your manager assigns to you will appear here.',
                      ),
                    ]);
                  }
                  return ListView.separated(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(AppSpacing.screen, 0, AppSpacing.screen, 108),
                    itemCount: list.length,
                    separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
                    itemBuilder: (context, i) => _TaskCard(task: list[i], onTap: () => _openDetail(list[i]))
                        .animate().fadeIn(duration: 260.ms, delay: (i * 40).ms).moveY(begin: 8, end: 0, curve: Curves.easeOutCubic),
                  );
                },
              ),
            ),
          ),
        ],
      ),
      ),
    );
  }

  void _openDetail(TaskItem task) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _TaskDetailSheet(task: task),
    );
  }
}

/// Task summary. Open work is the headline — that is what the employee acts on
/// — with completion progress underneath and the full breakdown below it.
class _TasksHero extends StatelessWidget {
  const _TasksHero({required this.tasks});
  final List<TaskItem> tasks;

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final open = tasks.where((t) => t.isOpen).length;
    final inProgress = tasks.where((t) => t.status == 'in_progress').length;
    final done = tasks.where((t) => t.isDone).length;
    final overdue =
        tasks.where((t) => t.isOpen && t.dueDate != null && t.dueDate!.isBefore(now)).length;
    final progress = tasks.isEmpty ? 0.0 : done / tasks.length;

    return HeroSurface(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('ASSIGNED TO YOU', style: AppTypography.overline(HeroSurface.onHeroMuted)),
              const Spacer(),
              if (overdue > 0)
                HeroChip(label: '$overdue overdue', tone: const Color(0xFFF59B9B)),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text('$open', style: AppTypography.numeric(40, FontWeight.w700, HeroSurface.onHero)),
              const SizedBox(width: AppSpacing.sm),
              Text(open == 1 ? 'task open' : 'tasks open',
                  style: context.text.bodyMedium?.copyWith(color: HeroSurface.onHeroMuted)),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.pill),
            child: Stack(
              children: [
                Container(height: 7, color: Colors.white.withValues(alpha: 0.18)),
                LayoutBuilder(
                  builder: (context, box) => AnimatedContainer(
                    duration: const Duration(milliseconds: 420),
                    curve: Curves.easeOutCubic,
                    height: 7,
                    width: box.maxWidth * progress,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                      gradient: const LinearGradient(colors: [Color(0xFF8FD8FF), Color(0xFF5BE0A8)]),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            tasks.isEmpty
                ? 'Nothing assigned yet'
                : '$done of ${tasks.length} complete',
            style: context.text.labelSmall
                ?.copyWith(color: HeroSurface.onHeroMuted, letterSpacing: 0.1),
          ),
          const SizedBox(height: AppSpacing.xl),
          Row(
            children: [
              _count(context, 'Open', open, const Color(0xFF9DC2F0)),
              _count(context, 'Active', inProgress, const Color(0xFF8FD8FF)),
              _count(context, 'Done', done, const Color(0xFF5BE0A8)),
              _count(context, 'Overdue', overdue, const Color(0xFFF59B9B)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _count(BuildContext context, String label, int value, Color dot) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(height: 7, width: 7, decoration: BoxDecoration(color: dot, shape: BoxShape.circle)),
              const SizedBox(width: 5),
              Flexible(
                child: Text(label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: context.text.bodySmall?.copyWith(color: HeroSurface.onHeroMuted)),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text('$value', style: AppTypography.numeric(19, FontWeight.w700, HeroSurface.onHero)),
        ],
      ),
    );
  }
}

class _FilterChips extends StatelessWidget {
  const _FilterChips({required this.value, required this.onChanged});
  final String value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    const options = [('open', 'Open'), ('done', 'Done'), ('all', 'All')];
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(color: c.surfaceAlt, borderRadius: BorderRadius.circular(AppRadius.pill)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final (key, label) in options)
            GestureDetector(
              onTap: () => onChanged(key),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: value == key ? c.surface : Colors.transparent,
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                  boxShadow: value == key ? [BoxShadow(color: c.shadow.withValues(alpha: 0.08), blurRadius: 6, offset: const Offset(0, 2))] : null,
                ),
                child: Text(label, style: context.text.labelMedium?.copyWith(color: value == key ? c.foreground : c.mutedForeground)),
              ),
            ),
        ],
      ),
    );
  }
}

class _TaskCard extends StatelessWidget {
  const _TaskCard({required this.task, required this.onTap});
  final TaskItem task;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final st = statusMeta(task.status);
    final pr = priorityMeta(task.priority);
    final tl = timeLeftMeta(task.dueDate, task.isDone);
    return AppCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(task.title, style: context.text.titleMedium, maxLines: 2, overflow: TextOverflow.ellipsis)),
              const SizedBox(width: AppSpacing.sm),
              StatusPill(pr.label, tone: pr.tone, dot: false),
            ],
          ),
          if (task.description != null && task.description!.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(task.description!, style: context.text.bodySmall?.copyWith(color: c.mutedForeground), maxLines: 1, overflow: TextOverflow.ellipsis),
          ],
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              StatusPill(st.label, tone: st.tone),
              const Spacer(),
              if (tl != null) StatusPill(tl.label, tone: tl.tone, icon: Icons.alarm_rounded),
            ],
          ),
        ],
      ),
    );
  }
}

class _TaskDetailSheet extends ConsumerStatefulWidget {
  const _TaskDetailSheet({required this.task});
  final TaskItem task;
  @override
  ConsumerState<_TaskDetailSheet> createState() => _TaskDetailSheetState();
}

class _TaskDetailSheetState extends ConsumerState<_TaskDetailSheet> {
  bool _busy = false;

  /// Next-status actions offered for the current status.
  List<({String label, String status, bool primary})> _actions(String status) {
    switch (status) {
      case 'todo':
      case 'backlog':
        return [(label: 'Start task', status: 'in_progress', primary: true)];
      case 'in_progress':
        return [(label: 'Mark done', status: 'done', primary: true), (label: 'Send to review', status: 'in_review', primary: false)];
      case 'in_review':
        return [(label: 'Mark done', status: 'done', primary: true)];
      case 'blocked':
        return [(label: 'Resume', status: 'in_progress', primary: true)];
      case 'done':
        return [(label: 'Reopen', status: 'in_progress', primary: false)];
      default:
        return [(label: 'Start task', status: 'in_progress', primary: true)];
    }
  }

  Future<void> _set(String status) async {
    setState(() => _busy = true);
    try {
      await ref.read(tasksControllerProvider.notifier).setStatus(widget.task.id, status);
      if (!mounted) return;
      HapticFeedback.mediumImpact();
      Navigator.of(context).pop();
      AppSnackbar.show(context, 'Task updated', tone: SnackTone.success);
    } catch (e) {
      if (mounted) AppSnackbar.show(context, e is ApiException ? e.message : 'Could not update the task.', tone: SnackTone.danger);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final t = widget.task;
    final st = statusMeta(t.status);
    final pr = priorityMeta(t.priority);
    final tl = timeLeftMeta(t.dueDate, t.isDone);

    return Container(
      decoration: BoxDecoration(color: c.surface, borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.xl2))),
      padding: EdgeInsets.only(left: AppSpacing.xl, right: AppSpacing.xl, top: AppSpacing.md, bottom: MediaQuery.of(context).padding.bottom + AppSpacing.xl),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: c.border, borderRadius: BorderRadius.circular(999)))),
          const SizedBox(height: AppSpacing.xl),
          Text(t.title, style: context.text.titleLarge),
          const SizedBox(height: AppSpacing.md),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: [
              StatusPill(st.label, tone: st.tone),
              StatusPill(pr.label, tone: pr.tone, dot: false),
              if (tl != null) StatusPill(tl.label, tone: tl.tone, icon: Icons.alarm_rounded),
              if (t.departmentName != null) StatusPill(t.departmentName!, tone: PillTone.neutral, dot: false),
            ],
          ),
          if (t.dueDate != null) ...[
            const SizedBox(height: AppSpacing.md),
            Row(children: [
              Icon(Icons.event_rounded, size: 15, color: c.mutedForeground),
              const SizedBox(width: 6),
              Text('Due ${DateFormat('EEE, d MMM').format(t.dueDate!)}', style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
            ]),
          ],
          if (t.description != null && t.description!.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.lg),
            Text(t.description!, style: context.text.bodyMedium?.copyWith(height: 1.5)),
          ],
          const SizedBox(height: AppSpacing.xl),
          for (final a in _actions(t.status)) ...[
            AppButton(
              label: a.label,
              loading: _busy && a.primary,
              variant: a.primary ? AppButtonVariant.primary : AppButtonVariant.secondary,
              onPressed: _busy ? null : () => _set(a.status),
            ),
            const SizedBox(height: AppSpacing.sm),
          ],
        ],
      ),
    );
  }
}

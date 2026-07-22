import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/pressable.dart';
import '../../../core/theme/app_shadows.dart';
import '../../../core/widgets/app_snackbar.dart';
import '../../../core/widgets/app_states.dart';
import '../../../core/widgets/hero_surface.dart';
import '../../../core/widgets/skeleton.dart';
import '../../../core/widgets/status_pill.dart';
import '../domain/task_item.dart';
import 'task_ui.dart';
import 'tasks_controller.dart';
import '../../../core/i18n/app_i18n.dart';

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

/// Task row with a priority-coloured spine down the left edge.
///
/// The spine carries urgency at a glance while the card body stays neutral —
/// a full-colour card per priority would make a scrolling list unreadable.
class _TaskCard extends StatelessWidget {
  const _TaskCard({required this.task, required this.onTap});
  final TaskItem task;
  final VoidCallback onTap;

  Color _spine(BuildContext context) {
    final c = context.colors;
    switch (task.priority) {
      case 'urgent':
        return c.danger;
      case 'high':
        return c.warning;
      case 'low':
        return c.success;
      default:
        return c.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final st = statusMeta(task.status);
    final pr = priorityMeta(task.priority);
    final tl = timeLeftMeta(task.dueDate, task.isDone);

    return Pressable(
      onTap: onTap,
      scale: 0.985,
      child: Container(
        decoration: BoxDecoration(
          color: c.surface,
          borderRadius: AppRadius.rXl,
          border: Border.all(color: c.border),
          boxShadow: AppShadows.card(c.shadow, dark: context.isDark),
        ),
        child: ClipRRect(
          borderRadius: AppRadius.rXl,
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(width: 4, color: _spine(context)),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                task.departmentName ?? 'Task',
                                style: context.text.labelSmall?.copyWith(
                                    color: c.mutedForeground, letterSpacing: 0.2),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Text(
                              pr.label.toUpperCase(),
                              style: context.text.labelSmall?.copyWith(
                                  color: _spine(context), letterSpacing: 0.6),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(task.title,
                            style: context.text.titleMedium,
                            maxLines: 2, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: AppSpacing.md),
                        Row(
                          children: [
                            Icon(Icons.schedule_rounded, size: 14, color: c.mutedForeground),
                            const SizedBox(width: 5),
                            Text(
                              tl?.label ?? (task.dueDate == null
                                  ? 'No due date'
                                  : DateFormat('d MMM').format(task.dueDate!)),
                              style: context.text.bodySmall?.copyWith(
                                  color: tl != null && tl.tone == PillTone.danger
                                      ? c.danger
                                      : c.mutedForeground),
                            ),
                            const Spacer(),
                            StatusPill(st.label, tone: st.tone),
                            const SizedBox(width: 4),
                            Icon(Icons.chevron_right_rounded, size: 18, color: c.mutedForeground),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
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

  /// The list endpoint does not resolve who assigned the task, so the sheet
  /// fetches the full record on open. Falls back to the list copy if that call
  /// fails — a missing assigner should not blank the sheet.
  late TaskItem _task = widget.task;

  @override
  void initState() {
    super.initState();
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    try {
      final full = await ref.read(taskRepositoryProvider).getOne(widget.task.id);
      if (mounted) setState(() => _task = full);
    } catch (_) {
      // Keep the list copy.
    }
  }

  /// Status changes an assignee may make directly.
  ///
  /// Completion is deliberately absent: an assignee reports the work finished
  /// via "Submit report", which moves the task to in_review for their
  /// department head to confirm. Closing your own task would defeat reporting
  /// upward, which is the point of the flow.
  List<({String label, String status, bool primary})> _actions(String status) {
    switch (status) {
      case 'todo':
      case 'backlog':
        return [(label: 'Start task', status: 'in_progress', primary: true)];
      case 'blocked':
        return [(label: 'Resume', status: 'in_progress', primary: true)];
      case 'in_progress':
      case 'in_review':
      case 'done':
      default:
        return const [];
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

  Future<void> _openSubmit(TaskItem t) async {
    final done = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _SubmitReportSheet(task: t),
    );
    if (done == true && mounted) Navigator.of(context).pop();
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
          if ((_task.assignedByName ?? '').isNotEmpty) ...[
            const SizedBox(height: AppSpacing.lg),
            Text(context.tr('Assigned by'), style: context.text.labelSmall?.copyWith(color: c.mutedForeground)),
            const SizedBox(height: 6),
            Row(
              children: [
                Container(
                  height: 38,
                  width: 38,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: c.primaryGradient,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      _initialsOf(_task.assignedByName!),
                      style: context.text.titleSmall
                          ?.copyWith(color: c.primaryForeground, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Text(_task.assignedByName!, style: context.text.titleSmall),
                ),
              ],
            ),
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
          if (t.status == 'in_review') ...[
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: c.tint(c.accent, 0.10),
                borderRadius: AppRadius.rLg,
                border: Border.all(color: c.tint(c.accent, 0.25)),
              ),
              child: Row(
                children: [
                  Icon(Icons.hourglass_top_rounded, size: 16, color: c.accent),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text('Submitted — waiting for your department head to confirm.',
                        style: context.text.bodySmall?.copyWith(color: c.foreground)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
          ],
          if (!t.isDone && t.status != 'in_review')
            AppButton(
              label: 'Submit report',
              icon: Icons.upload_file_rounded,
              onPressed: _busy ? null : () => _openSubmit(t),
            ),
        ],
      ),
    );
  }
}

/// Reporting back on a task: what was done, any supporting documents, and
/// whether the work is finished.
///
/// Attachments upload as they are picked rather than on submit, so a large
/// photo on a poor connection cannot silently lose the written note — by the
/// time the note is sent, the files are already on the server.
String _initialsOf(String name) {
  final parts = name.trim().split(RegExp(r'\s+'));
  final a = parts.isNotEmpty && parts[0].isNotEmpty ? parts[0][0] : '';
  final b = parts.length > 1 && parts[1].isNotEmpty ? parts[1][0] : '';
  return (a + b).toUpperCase();
}

class _SubmitReportSheet extends ConsumerStatefulWidget {
  const _SubmitReportSheet({required this.task});
  final TaskItem task;

  @override
  ConsumerState<_SubmitReportSheet> createState() => _SubmitReportSheetState();
}

class _SubmitReportSheetState extends ConsumerState<_SubmitReportSheet> {
  final _note = TextEditingController();
  final _picker = ImagePicker();
  final List<String> _attached = [];
  bool _busy = false;
  bool _uploading = false;
  bool _markComplete = false;

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  Future<void> _attach(ImageSource source) async {
    try {
      final picked = await _picker.pickImage(source: source, imageQuality: 70, maxWidth: 2000);
      if (picked == null) return;
      setState(() => _uploading = true);
      final bytes = await picked.readAsBytes();
      final name = picked.name.isEmpty ? 'attachment.jpg' : picked.name;
      await ref.read(taskRepositoryProvider).attach(
            widget.task.id,
            bytes,
            filename: name,
            contentType: picked.mimeType ?? 'image/jpeg',
          );
      if (!mounted) return;
      setState(() => _attached.add(name));
      AppSnackbar.show(context, 'Attached $name', tone: SnackTone.success);
    } on ApiException catch (e) {
      if (mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    } catch (_) {
      if (mounted) AppSnackbar.show(context, 'Could not attach that file.', tone: SnackTone.danger);
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _submit() async {
    final note = _note.text.trim();
    if (note.isEmpty) {
      AppSnackbar.show(context, 'Write a short note about what you did.', tone: SnackTone.neutral);
      return;
    }
    setState(() => _busy = true);
    try {
      final res = await ref.read(taskRepositoryProvider).submit(
            widget.task.id,
            note: note,
            markComplete: _markComplete,
          );
      ref.invalidate(tasksControllerProvider);
      if (!mounted) return;
      HapticFeedback.mediumImpact();
      Navigator.of(context).pop(true);
      AppSnackbar.show(
        context,
        _markComplete
            ? 'Submitted for review${res.attachments > 0 ? ' with ${res.attachments} document(s)' : ''}.'
            : 'Update sent to your department head.',
        tone: SnackTone.success,
      );
    } on ApiException catch (e) {
      if (mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    } catch (_) {
      if (mounted) AppSnackbar.show(context, 'Could not submit the report.', tone: SnackTone.danger);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.xl2)),
      ),
      padding: EdgeInsets.only(
        left: AppSpacing.xl,
        right: AppSpacing.xl,
        top: AppSpacing.md,
        bottom: MediaQuery.of(context).viewInsets.bottom + MediaQuery.of(context).padding.bottom + AppSpacing.xl,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(color: c.border, borderRadius: BorderRadius.circular(999)),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            Text(context.tr('Submit report'), style: context.text.titleLarge),
            const SizedBox(height: 2),
            Text(widget.task.title,
                style: context.text.bodySmall?.copyWith(color: c.mutedForeground),
                maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: AppSpacing.lg),

            Text(context.tr('What did you do?'), style: context.text.titleSmall),
            const SizedBox(height: 6),
            TextField(
              controller: _note,
              minLines: 3,
              maxLines: 6,
              textCapitalization: TextCapitalization.sentences,
              decoration: const InputDecoration(hintText: 'Summarise the work for your department head…'),
            ),
            const SizedBox(height: AppSpacing.lg),

            Text('Documents', style: context.text.titleSmall),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _uploading ? null : () => _attach(ImageSource.camera),
                    icon: const Icon(Icons.photo_camera_rounded, size: 18),
                    label: Text(context.tr('Camera')),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _uploading ? null : () => _attach(ImageSource.gallery),
                    icon: const Icon(Icons.attach_file_rounded, size: 18),
                    label: Text(context.tr('Gallery')),
                  ),
                ),
              ],
            ),
            if (_uploading) ...[
              const SizedBox(height: AppSpacing.sm),
              Row(children: [
                SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: c.primary)),
                const SizedBox(width: AppSpacing.sm),
                Text('Uploading…', style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
              ]),
            ],
            if (_attached.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: [
                  for (final f in _attached)
                    StatusPill(f, tone: PillTone.success, icon: Icons.check_rounded, dot: false),
                ],
              ),
            ],
            const SizedBox(height: AppSpacing.lg),

            // in_review, not done: the head confirms completion.
            InkWell(
              onTap: () => setState(() => _markComplete = !_markComplete),
              borderRadius: AppRadius.rLg,
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  borderRadius: AppRadius.rLg,
                  border: Border.all(color: _markComplete ? c.primary : c.border),
                  color: _markComplete ? c.tint(c.primary, 0.06) : null,
                ),
                child: Row(
                  children: [
                    Icon(_markComplete ? Icons.check_circle_rounded : Icons.circle_outlined,
                        size: 20, color: _markComplete ? c.primary : c.mutedForeground),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(context.tr('The work is finished'), style: context.text.titleSmall),
                          Text('Sends it to your department head to confirm',
                              style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            // States the rule before they tap, not after the status surprises
            // them: an assignee cannot close their own task.
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: c.tint(c.info, 0.10),
                borderRadius: AppRadius.rLg,
              ),
              child: Row(
                children: [
                  Icon(Icons.shield_outlined, size: 16, color: c.info),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(context.tr('You cannot mark your own task done. Finished work moves to In Review.'),
                      style: context.text.bodySmall?.copyWith(color: c.foreground),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            AppButton(label: 'Send to department head', loading: _busy, onPressed: _busy ? null : _submit),
          ],
        ),
      ),
    );
  }
}

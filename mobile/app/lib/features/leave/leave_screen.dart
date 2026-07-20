import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/network/api_exception.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/widgets/ambient_background.dart';
import '../../core/widgets/app_card.dart';
import '../../core/widgets/app_snackbar.dart';
import '../../core/widgets/app_states.dart';
import '../../core/widgets/hero_surface.dart';
import '../../core/widgets/skeleton.dart';
import '../../core/widgets/status_pill.dart';
import 'leave_providers.dart';

/// The employee's leave tab: apply for time off and track whether the request
/// was approved or rejected by their department head.
class LeaveScreen extends ConsumerWidget {
  const LeaveScreen({super.key});

  static PillTone _tone(String status) => switch (status) {
        'approved' => PillTone.success,
        'rejected' => PillTone.danger,
        'cancelled' => PillTone.neutral,
        _ => PillTone.warning, // pending
      };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = context.colors;
    final leave = ref.watch(myLeaveProvider);

    return AmbientBackground(
      child: SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.screen, AppSpacing.lg, AppSpacing.screen, AppSpacing.md),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Leave', style: context.text.headlineSmall),
                      Text('Request time off and track approvals',
                          style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
                    ],
                  ),
                ),
                FilledButton.icon(
                  onPressed: () => _openApplySheet(context, ref),
                  icon: const Icon(Icons.add_rounded, size: 18),
                  label: const Text('Apply'),
                ),
              ],
            ),
          ),

          // Allowance and approval counts in one hero, so the number that
          // matters most — days left — leads instead of competing with five
          // equal-weight boxes.
          const _LeaveHero(),
          const SizedBox(height: AppSpacing.xl2),

          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.screen, 0, AppSpacing.screen, AppSpacing.md),
            child: Row(
              children: [
                Expanded(child: Text('Your requests', style: context.text.titleLarge)),
              ],
            ),
          ),

          Expanded(
            child: RefreshIndicator(
              color: c.primary,
              onRefresh: () async => ref.invalidate(myLeaveProvider),
              child: leave.when(
                loading: () => ListView(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screen),
                  children: List.generate(4, (_) => const Padding(
                      padding: EdgeInsets.only(bottom: AppSpacing.md), child: AppCard(child: Skeleton(height: 72)))),
                ),
                error: (e, _) => ListView(
                  padding: const EdgeInsets.all(AppSpacing.screen),
                  children: [
                    AppCard(child: ErrorStateView(
                      message: e is ApiException ? e.message : 'Couldn’t load your leave requests.',
                      onRetry: () => ref.invalidate(myLeaveProvider),
                    )),
                  ],
                ),
                data: (rows) {
                  if (rows.isEmpty) {
                    return ListView(
                      padding: const EdgeInsets.all(AppSpacing.screen),
                      children: const [
                        AppCard(child: EmptyState(
                          icon: Icons.event_available_rounded,
                          title: 'No leave requests',
                          message: 'Tap Apply to request time off. Your department head reviews it.',
                        )),
                      ],
                    );
                  }
                  return ListView.separated(
                    padding: const EdgeInsets.fromLTRB(AppSpacing.screen, 0, AppSpacing.screen, 108),
                    itemCount: rows.length,
                    separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
                    itemBuilder: (context, i) => _LeaveCard(
                      request: rows[i],
                      onCancel: () => _cancel(context, ref, rows[i]),
                    ),
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

  Future<void> _cancel(BuildContext context, WidgetRef ref, LeaveRequest r) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (dctx) => AlertDialog(
        title: const Text('Withdraw request?'),
        content: Text('Cancel your ${r.leaveType} leave from '
            '${DateFormat('d MMM').format(r.startDate)} to ${DateFormat('d MMM').format(r.endDate)}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dctx, false), child: const Text('Keep')),
          FilledButton(onPressed: () => Navigator.pop(dctx, true), child: const Text('Withdraw')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await ref.read(leaveActionsProvider).cancel(r.id);
      if (context.mounted) AppSnackbar.show(context, 'Leave request withdrawn.', tone: SnackTone.success);
    } on ApiException catch (e) {
      if (context.mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    }
  }

  Future<void> _openApplySheet(BuildContext context, WidgetRef ref) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.colors.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl2))),
      builder: (_) => const _ApplyLeaveSheet(),
    );
  }
}

/// Remaining allowance per leave type.
///
/// Annual counts down from the allowance the super admin sets in the web
/// dashboard. Sick is additional — it does not consume the annual allowance, so
/// there is no number to count down; it still needs approval either way.
class _LeaveHero extends ConsumerWidget {
  const _LeaveHero();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final balances = ref.watch(myLeaveBalancesProvider);
    final requests = ref.watch(myLeaveProvider).valueOrNull ?? const <LeaveRequest>[];

    return balances.maybeWhen(
      data: (rows) {
        if (rows.isEmpty) return const SizedBox.shrink();
        // Annual is the capped type and the only one with a countdown, so it
        // takes the headline. Sick has no ceiling, so it rides along as a chip
        // rather than pretending to be a second number.
        final annual = rows.where((b) => !b.isAdditional).firstOrNull;
        final additional = rows.where((b) => b.isAdditional).toList();

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screen),
          child: HeroSurface(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('ANNUAL LEAVE', style: AppTypography.overline(HeroSurface.onHeroMuted)),
                    const Spacer(),
                    for (final b in additional)
                      HeroChip(label: '${b.leaveType} · additional', icon: Icons.healing_rounded),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                if (annual == null)
                  Text('No annual allowance set',
                      style: context.text.titleMedium?.copyWith(color: HeroSurface.onHero))
                else ...[
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(fmtDays(annual.remaining ?? 0),
                          style: AppTypography.numeric(40, FontWeight.w700, HeroSurface.onHero)),
                      const SizedBox(width: AppSpacing.sm),
                      Text('of ${fmtDays(annual.allotted ?? 0)} days left',
                          style: context.text.bodyMedium?.copyWith(color: HeroSurface.onHeroMuted)),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _AllowanceBar(
                    used: annual.taken,
                    pending: annual.pending,
                    total: annual.allotted ?? 0,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    annual.pending > 0
                        ? 'Deducted on approval · ${fmtDays(annual.pending)} awaiting a decision'
                        : 'Days are deducted only once your head approves',
                    style: context.text.labelSmall?.copyWith(color: HeroSurface.onHeroMuted, letterSpacing: 0.1),
                  ),
                ],
                const SizedBox(height: AppSpacing.xl),
                Row(
                  children: [
                    _heroCount(context, 'Pending', requests.where((r) => r.isPending).length, const Color(0xFFF5C56B)),
                    _heroCount(context, 'Approved', requests.where((r) => r.isApproved).length, const Color(0xFF5BE0A8)),
                    _heroCount(context, 'Rejected', requests.where((r) => r.isRejected).length, const Color(0xFFF59B9B)),
                  ],
                ),
              ],
            ),
          ),
        );
      },
      orElse: () => const SizedBox.shrink(),
    );
  }

  Widget _heroCount(BuildContext context, String label, int value, Color dot) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(height: 7, width: 7, decoration: BoxDecoration(color: dot, shape: BoxShape.circle)),
              const SizedBox(width: 6),
              Text(label, style: context.text.bodySmall?.copyWith(color: HeroSurface.onHeroMuted)),
            ],
          ),
          const SizedBox(height: 2),
          Text('$value', style: AppTypography.numeric(19, FontWeight.w700, HeroSurface.onHero)),
        ],
      ),
    );
  }
}

/// Allowance track showing taken days solid and pending days hatched-light, so
/// "already gone" and "might go" stay visually distinct.
class _AllowanceBar extends StatelessWidget {
  const _AllowanceBar({required this.used, required this.pending, required this.total});
  final double used;
  final double pending;
  final double total;

  @override
  Widget build(BuildContext context) {
    final t = total <= 0 ? 1.0 : total;
    final usedF = (used / t).clamp(0.0, 1.0);
    final pendF = (pending / t).clamp(0.0, 1.0 - usedF);

    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.pill),
      child: SizedBox(
        height: 7,
        child: Row(
          children: [
            Expanded(flex: (usedF * 1000).round(), child: Container(color: const Color(0xFF5BE0A8))),
            Expanded(flex: (pendF * 1000).round(), child: Container(color: const Color(0xFFF5C56B))),
            Expanded(
              flex: ((1 - usedF - pendF) * 1000).round(),
              child: Container(color: Colors.white.withValues(alpha: 0.18)),
            ),
          ],
        ),
      ),
    );
  }
}

/// Drop the trailing ".0" so 17.0 reads as 17 but a half-day stays 0.5.
String fmtDays(double v) =>
    v == v.roundToDouble() ? v.toInt().toString() : v.toStringAsFixed(1);

class _LeaveCard extends StatelessWidget {
  const _LeaveCard({required this.request, required this.onCancel});
  final LeaveRequest request;
  final VoidCallback onCancel;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final fmt = DateFormat('d MMM yyyy');
    final days = request.days == request.days.roundToDouble()
        ? request.days.toInt().toString()
        : request.days.toStringAsFixed(1);

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text('${request.leaveType} · $days ${request.days == 1 ? 'day' : 'days'}',
                    style: context.text.titleSmall),
              ),
              StatusPill(request.status, tone: LeaveScreen._tone(request.status)),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Icon(Icons.calendar_today_rounded, size: 14, color: c.mutedForeground),
              const SizedBox(width: 6),
              Text('${fmt.format(request.startDate)}  →  ${fmt.format(request.endDate)}',
                  style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
            ],
          ),
          if ((request.reason ?? '').isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(request.reason!, style: context.text.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
          ],
          if (request.isPending) ...[
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Icon(Icons.hourglass_top_rounded, size: 14, color: c.warning),
                const SizedBox(width: 6),
                Expanded(
                  child: Text('Waiting for your department head to review',
                      style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
                ),
                TextButton(onPressed: onCancel, child: const Text('Withdraw')),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

/// Bottom sheet to submit a new request.
class _ApplyLeaveSheet extends ConsumerStatefulWidget {
  const _ApplyLeaveSheet();

  @override
  ConsumerState<_ApplyLeaveSheet> createState() => _ApplyLeaveSheetState();
}

class _ApplyLeaveSheetState extends ConsumerState<_ApplyLeaveSheet> {
  String? _typeId;
  DateTimeRange? _range;
  final _reason = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _reason.dispose();
    super.dispose();
  }

  int get _days => _range == null ? 0 : _range!.end.difference(_range!.start).inDays + 1;

  Future<void> _pickDates() async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 2),
      initialDateRange: _range,
    );
    if (picked != null) setState(() => _range = picked);
  }

  Future<void> _submit() async {
    if (_typeId == null || _range == null) return;
    setState(() => _saving = true);
    try {
      await ref.read(leaveActionsProvider).apply(
            leaveTypeId: _typeId!,
            start: _range!.start,
            end: _range!.end,
            reason: _reason.text.trim().isEmpty ? null : _reason.text.trim(),
          );
      if (mounted) {
        Navigator.pop(context);
        AppSnackbar.show(context, 'Leave request submitted for approval.', tone: SnackTone.success);
      }
    } on ApiException catch (e) {
      if (mounted) AppSnackbar.show(context, e.message, tone: SnackTone.danger);
    } catch (_) {
      if (mounted) AppSnackbar.show(context, 'Could not submit the request.', tone: SnackTone.danger);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final types = ref.watch(leaveTypesProvider);
    final canSubmit = _typeId != null && _range != null && !_saving;

    return Padding(
      padding: EdgeInsets.only(
        left: AppSpacing.xl, right: AppSpacing.xl, top: AppSpacing.xl,
        bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.xl,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Apply for leave', style: context.text.titleLarge),
          const SizedBox(height: AppSpacing.lg),

          Text('Leave type', style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
          const SizedBox(height: 6),
          types.when(
            loading: () => const Skeleton(height: 48),
            error: (_, _) => Text('Could not load leave types',
                style: context.text.bodySmall?.copyWith(color: c.danger)),
            data: (list) => Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: list.map((t) {
                final selected = t.id == _typeId;
                return ChoiceChip(
                  label: Text(t.name),
                  selected: selected,
                  onSelected: (_) => setState(() => _typeId = t.id),
                );
              }).toList(),
            ),
          ),

          // Tell the employee the cap up front rather than only on refusal.
          if (_typeId != null)
            ref.watch(myLeaveBalancesProvider).maybeWhen(
                  data: (rows) {
                    final b = rows.where((x) => x.leaveTypeId == _typeId).firstOrNull;
                    if (b == null) return const SizedBox.shrink();
                    // Quote `available`, not `remaining` — pending days are held
                    // back by the API, so offering `remaining` would promise days
                    // the submit would then reject.
                    final n = fmtDays;
                    final text = b.isAdditional
                        ? 'Additional leave — no yearly limit, still needs your head\'s approval.'
                        : b.pending > 0
                            ? 'You can request up to ${n(b.available ?? 0)} day(s) — '
                                '${n(b.pending)} of your ${n(b.remaining ?? 0)} remaining day(s) '
                                'are awaiting a decision.'
                            : '${n(b.remaining ?? 0)} of ${n(b.allotted ?? 0)} days left this year. '
                                'Days are only deducted once your head approves.';
                    return Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.sm),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.info_outline_rounded, size: 14, color: c.mutedForeground),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(text,
                                style: context.text.labelSmall?.copyWith(color: c.mutedForeground)),
                          ),
                        ],
                      ),
                    );
                  },
                  orElse: () => const SizedBox.shrink(),
                ),
          const SizedBox(height: AppSpacing.lg),

          Text('Dates', style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
          const SizedBox(height: 6),
          InkWell(
            onTap: _pickDates,
            borderRadius: AppRadius.rLg,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.md),
              decoration: BoxDecoration(borderRadius: AppRadius.rLg, border: Border.all(color: c.border)),
              child: Row(
                children: [
                  Icon(Icons.date_range_rounded, size: 18, color: c.mutedForeground),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      _range == null
                          ? 'Select start and end date'
                          : '${DateFormat('d MMM').format(_range!.start)} → ${DateFormat('d MMM yyyy').format(_range!.end)}  ($_days ${_days == 1 ? 'day' : 'days'})',
                      style: context.text.bodyMedium?.copyWith(
                          color: _range == null ? c.mutedForeground : c.foreground),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          Text('Reason (optional)', style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
          const SizedBox(height: 6),
          TextField(
            controller: _reason,
            maxLines: 3,
            decoration: const InputDecoration(hintText: 'e.g. Family event'),
          ),
          const SizedBox(height: AppSpacing.xl),

          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: canSubmit ? _submit : null,
              child: _saving
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2.2))
                  : const Text('Submit request'),
            ),
          ),
        ],
      ),
    );
  }
}

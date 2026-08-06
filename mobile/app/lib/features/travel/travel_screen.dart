import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/i18n/app_i18n.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/app_button.dart';
import 'travel_providers.dart';
import 'travel_request_sheet.dart';
import 'travel_report_sheet.dart';

/// The employee's own business trips: status at a glance, request a new one,
/// and file the accountability report once the trip is approved.
class TravelScreen extends ConsumerWidget {
  const TravelScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = context.colors;
    final trips = ref.watch(myTripsProvider);

    return Scaffold(
      appBar: AppBar(title: Text(context.tr('Business Travel'))),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final created = await showModalBottomSheet<bool>(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (_) => const TravelRequestSheet(),
          );
          if (created == true) ref.invalidate(myTripsProvider);
        },
        icon: const Icon(Icons.add_rounded),
        label: Text(context.tr('New request')),
      ),
      body: trips.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.screen),
            child: Text(context.tr('Could not load your trips.'),
                style: context.text.bodyMedium?.copyWith(color: c.mutedForeground)),
          ),
        ),
        data: (list) => list.isEmpty
            ? _Empty(onNew: () async {
                final created = await showModalBottomSheet<bool>(
                  context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
                  builder: (_) => const TravelRequestSheet(),
                );
                if (created == true) ref.invalidate(myTripsProvider);
              })
            : RefreshIndicator(
                onRefresh: () async => ref.invalidate(myTripsProvider),
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(
                      AppSpacing.screen, AppSpacing.screen, AppSpacing.screen, 96),
                  itemCount: list.length,
                  separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
                  itemBuilder: (_, i) => _TripCard(
                    trip: list[i],
                    onReport: () async {
                      final filed = await showModalBottomSheet<bool>(
                        context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
                        builder: (_) => TravelReportSheet(trip: list[i]),
                      );
                      if (filed == true) ref.invalidate(myTripsProvider);
                    },
                  ),
                ),
              ),
      ),
    );
  }
}

class _TripCard extends StatelessWidget {
  const _TripCard({required this.trip, required this.onReport});
  final TravelTrip trip;
  final VoidCallback onReport;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(color: c.surface, borderRadius: AppRadius.rLg, border: Border.all(color: c.border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(trip.destination, style: context.text.titleMedium),
                    Text(trip.reference, style: context.text.labelSmall?.copyWith(color: c.mutedForeground)),
                  ],
                ),
              ),
              _StatusChip(status: trip.status),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(trip.purpose, maxLines: 2, overflow: TextOverflow.ellipsis,
              style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              Icon(Icons.calendar_today_rounded, size: 14, color: c.mutedForeground),
              const SizedBox(width: 6),
              Text('${_d(trip.startDate)} – ${_d(trip.endDate)} · ${trip.durationDays}d',
                  style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
            ],
          ),
          if (trip.advanceTotal > 0) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.account_balance_wallet_rounded, size: 14, color: c.mutedForeground),
                const SizedBox(width: 6),
                Text('${context.tr('Advance')} IDR ${_money(trip.advanceTotal)}',
                    style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
              ],
            ),
          ],
          // Sign carries meaning, so it is spelled out rather than shown raw.
          if (trip.settlementAmount != null && trip.settlementAmount != 0) ...[
            const SizedBox(height: 4),
            Text(
              trip.settlementAmount! > 0
                  ? '${context.tr('To be reimbursed')}: IDR ${_money(trip.settlementAmount!)}'
                  : '${context.tr('To return')}: IDR ${_money(trip.settlementAmount!.abs())}',
              style: context.text.bodySmall?.copyWith(
                color: trip.settlementAmount! > 0 ? c.success : c.warning,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
          if (trip.canFileReport) ...[
            const SizedBox(height: AppSpacing.md),
            AppButton(label: context.tr('File report'), onPressed: onReport),
          ],
        ],
      ),
    );
  }

  static String _d(DateTime d) => '${d.day}/${d.month}';
  static String _money(double v) {
    final s = v.round().toString();
    final b = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) b.write('.');
      b.write(s[i]);
    }
    return b.toString();
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});
  final String status;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final (label, color) = switch (status) {
      'draft' => (context.tr('Draft'), c.mutedForeground),
      'submitted' => (context.tr('Awaiting approval'), c.warning),
      'approved' => (context.tr('Approved'), c.info),
      'rejected' => (context.tr('Rejected'), c.danger),
      'advance_paid' => (context.tr('Advance paid'), c.primary),
      'realization_submitted' => (context.tr('Report submitted'), c.warning),
      'verified' => (context.tr('Awaiting settlement'), c.info),
      'completed' => (context.tr('Completed'), c.success),
      _ => (context.tr('Cancelled'), c.mutedForeground),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: c.tint(color, 0.12), borderRadius: AppRadius.rSm),
      child: Text(label, style: context.text.labelSmall?.copyWith(color: color, fontWeight: FontWeight.w600)),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty({required this.onNew});
  final VoidCallback onNew;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.flight_takeoff_rounded, size: 44, color: c.mutedForeground),
            const SizedBox(height: AppSpacing.md),
            Text(context.tr('No business trips yet'), style: context.text.titleMedium),
            const SizedBox(height: 6),
            Text(context.tr('Submit a request and track its approval here.'),
                textAlign: TextAlign.center,
                style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
            const SizedBox(height: AppSpacing.lg),
            AppButton(label: context.tr('New request'), onPressed: onNew),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/i18n/app_i18n.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/app_snackbar.dart';
import 'travel_providers.dart';

/// Step 4 on mobile: what actually happened, what it cost, and the day-by-day
/// activity log. Kept deliberately light — evidence upload stays on the web
/// app, where reviewing a PDF is practical.
class TravelReportSheet extends ConsumerStatefulWidget {
  const TravelReportSheet({super.key, required this.trip});
  final TravelTrip trip;

  @override
  ConsumerState<TravelReportSheet> createState() => _TravelReportSheetState();
}

class _TravelReportSheetState extends ConsumerState<TravelReportSheet> {
  late DateTime _departure = widget.trip.startDate;
  late DateTime _returned = widget.trip.endDate;
  final _transportUsed = TextEditingController();
  final _hotelUsed = TextEditingController();
  final _transport = TextEditingController();
  final _hotel = TextEditingController();
  final _allowance = TextEditingController();
  final List<_Activity> _activities = [];
  bool _busy = false;

  @override
  void dispose() {
    for (final c in [_transportUsed, _hotelUsed, _transport, _hotel, _allowance]) {
      c.dispose();
    }
    super.dispose();
  }

  double get _total =>
      (double.tryParse(_transport.text) ?? 0) +
      (double.tryParse(_hotel.text) ?? 0) +
      (double.tryParse(_allowance.text) ?? 0);

  Future<void> _submit() async {
    setState(() => _busy = true);
    try {
      await ref.read(travelRepositoryProvider).fileReport(
            widget.trip.id,
            departure: _departure,
            returned: _returned,
            transportUsed: _transportUsed.text.trim(),
            hotelUsed: _hotelUsed.text.trim(),
            transport: double.tryParse(_transport.text) ?? 0,
            hotel: double.tryParse(_hotel.text) ?? 0,
            allowance: double.tryParse(_allowance.text) ?? 0,
            activities: _activities
                .where((a) => a.description.text.trim().isNotEmpty)
                .map((a) => {
                      'date': a.date.toIso8601String().substring(0, 10),
                      'time': a.time.text.trim().isEmpty ? '09:00' : a.time.text.trim(),
                      'description': a.description.text.trim(),
                    })
                .toList(),
          );
      if (!mounted) return;
      AppSnackbar.show(context, context.tr('Report submitted for verification'), tone: SnackTone.success);
      Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) AppSnackbar.show(context, e.toString(), tone: SnackTone.danger);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final advance = widget.trip.advanceTotal;
    final diff = _total - advance;

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.9),
        decoration: BoxDecoration(
          color: c.background,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.all(AppSpacing.screen),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(width: 40, height: 4,
                  decoration: BoxDecoration(color: c.border, borderRadius: BorderRadius.circular(2))),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(context.tr('Accountability report'), style: context.text.titleLarge),
              Text('${widget.trip.reference} · ${widget.trip.destination}',
                  style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
              const SizedBox(height: AppSpacing.lg),

              Row(children: [
                Expanded(child: _DateField(label: context.tr('Actual departure'), value: _departure,
                    onTap: () => _pick(true))),
                const SizedBox(width: AppSpacing.md),
                Expanded(child: _DateField(label: context.tr('Actual return'), value: _returned,
                    onTap: () => _pick(false))),
              ]),
              const SizedBox(height: AppSpacing.md),
              TextField(controller: _transportUsed,
                decoration: InputDecoration(labelText: context.tr('Transportation used'), hintText: 'Garuda Indonesia')),
              const SizedBox(height: AppSpacing.md),
              TextField(controller: _hotelUsed,
                decoration: InputDecoration(labelText: context.tr('Hotel used'), hintText: 'Harris Hotel')),

              const SizedBox(height: AppSpacing.lg),
              Text(context.tr('Actual spend (IDR)'), style: context.text.labelLarge),
              const SizedBox(height: AppSpacing.sm),
              _Money(controller: _transport, label: context.tr('Transportation'), onChanged: () => setState(() {})),
              const SizedBox(height: AppSpacing.sm),
              _Money(controller: _hotel, label: context.tr('Hotel'), onChanged: () => setState(() {})),
              const SizedBox(height: AppSpacing.sm),
              _Money(controller: _allowance, label: context.tr('Allowance'), onChanged: () => setState(() {})),

              const SizedBox(height: AppSpacing.sm),
              // Shows the consequence before submitting, so nobody is surprised
              // by a claw-back after finance verifies.
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: c.tint(diff > 0 ? c.success : diff < 0 ? c.warning : c.mutedForeground, 0.10),
                  borderRadius: AppRadius.rLg,
                ),
                child: Text(
                  diff == 0
                      ? context.tr('Spend matches the advance — nothing to settle.')
                      : diff > 0
                          ? '${context.tr('You may be reimbursed')} IDR ${diff.round()}'
                          : '${context.tr('You may need to return')} IDR ${diff.abs().round()}',
                  style: context.text.bodySmall,
                ),
              ),

              const SizedBox(height: AppSpacing.lg),
              Row(
                children: [
                  Expanded(child: Text(context.tr('Activity log'), style: context.text.labelLarge)),
                  TextButton.icon(
                    onPressed: () => setState(() => _activities.add(_Activity(date: _departure))),
                    icon: const Icon(Icons.add_rounded, size: 18),
                    label: Text(context.tr('Add')),
                  ),
                ],
              ),
              ..._activities.asMap().entries.map((e) => Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: Row(
                      children: [
                        SizedBox(width: 70,
                          child: TextField(controller: e.value.time,
                            decoration: const InputDecoration(hintText: '08:00', isDense: true))),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: TextField(controller: e.value.description,
                            decoration: InputDecoration(hintText: context.tr('What you did'), isDense: true)),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close_rounded, size: 18),
                          onPressed: () => setState(() => _activities.removeAt(e.key)),
                        ),
                      ],
                    ),
                  )),

              const SizedBox(height: AppSpacing.lg),
              AppButton(
                label: _busy ? context.tr('Submitting…') : context.tr('Submit report'),
                onPressed: _busy ? null : _submit,
              ),
              const SizedBox(height: AppSpacing.md),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pick(bool departure) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: departure ? _departure : _returned,
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked == null) return;
    setState(() {
      if (departure) {
        _departure = picked;
        if (_returned.isBefore(picked)) _returned = picked;
      } else {
        _returned = picked;
      }
    });
  }
}

class _Activity {
  _Activity({required this.date});
  final DateTime date;
  final TextEditingController time = TextEditingController(text: '09:00');
  final TextEditingController description = TextEditingController();
}

class _DateField extends StatelessWidget {
  const _DateField({required this.label, required this.value, required this.onTap});
  final String label;
  final DateTime value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        child: InputDecorator(
          decoration: InputDecoration(labelText: label),
          child: Text('${value.day}/${value.month}/${value.year}', style: context.text.bodyMedium),
        ),
      );
}

class _Money extends StatelessWidget {
  const _Money({required this.controller, required this.label, required this.onChanged});
  final TextEditingController controller;
  final String label;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) => TextField(
        controller: controller,
        keyboardType: TextInputType.number,
        onChanged: (_) => onChanged(),
        decoration: InputDecoration(labelText: label, prefixText: 'IDR '),
      );
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/i18n/app_i18n.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/app_snackbar.dart';
import 'travel_providers.dart';

const _transport = ['flight', 'train', 'car', 'bus', 'other'];

/// Step 1 on mobile. Name, ID and department are filled in by the server from
/// the signed-in account, so the form only asks about the trip itself.
class TravelRequestSheet extends ConsumerStatefulWidget {
  const TravelRequestSheet({super.key});

  @override
  ConsumerState<TravelRequestSheet> createState() => _TravelRequestSheetState();
}

class _TravelRequestSheetState extends ConsumerState<TravelRequestSheet> {
  final _destination = TextEditingController();
  final _purpose = TextEditingController();
  final _transportCost = TextEditingController();
  final _hotelCost = TextEditingController();
  final _allowance = TextEditingController();
  DateTime _start = DateTime.now();
  DateTime _end = DateTime.now();
  String _mode = 'flight';
  bool _hotel = false;
  bool _busy = false;

  @override
  void dispose() {
    for (final c in [_destination, _purpose, _transportCost, _hotelCost, _allowance]) {
      c.dispose();
    }
    super.dispose();
  }

  double get _total =>
      (double.tryParse(_transportCost.text) ?? 0) +
      (double.tryParse(_hotelCost.text) ?? 0) +
      (double.tryParse(_allowance.text) ?? 0);

  Future<void> _pick(bool start) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: start ? _start : _end,
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked == null) return;
    setState(() {
      if (start) {
        _start = picked;
        if (_end.isBefore(picked)) _end = picked;
      } else {
        _end = picked;
      }
    });
  }

  Future<void> _submit() async {
    if (_destination.text.trim().isEmpty || _purpose.text.trim().isEmpty) {
      AppSnackbar.show(context, context.tr('Destination and purpose are required.'), tone: SnackTone.danger);
      return;
    }
    setState(() => _busy = true);
    try {
      final repo = ref.read(travelRepositoryProvider);
      final trip = await repo.create(
        destination: _destination.text.trim(),
        purpose: _purpose.text.trim(),
        start: _start,
        end: _end,
        transportation: _mode,
        hotelNeeded: _hotel,
        transport: double.tryParse(_transportCost.text) ?? 0,
        hotel: double.tryParse(_hotelCost.text) ?? 0,
        allowance: double.tryParse(_allowance.text) ?? 0,
      );
      await repo.submit(trip.id);
      if (!mounted) return;
      AppSnackbar.show(context, '${context.tr('Request submitted')} · ${trip.reference}', tone: SnackTone.success);
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
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
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
              Text(context.tr('New travel request'), style: context.text.titleLarge),
              const SizedBox(height: AppSpacing.lg),

              TextField(controller: _destination,
                decoration: InputDecoration(labelText: context.tr('Destination city'))),
              const SizedBox(height: AppSpacing.md),
              TextField(controller: _purpose, maxLines: 2,
                decoration: InputDecoration(labelText: context.tr('Purpose'))),
              const SizedBox(height: AppSpacing.md),

              Row(
                children: [
                  Expanded(child: _DateField(label: context.tr('Departure'), value: _start, onTap: () => _pick(true))),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(child: _DateField(label: context.tr('Return'), value: _end, onTap: () => _pick(false))),
                ],
              ),
              const SizedBox(height: AppSpacing.md),

              DropdownButtonFormField<String>(
                initialValue: _mode,
                decoration: InputDecoration(labelText: context.tr('Transportation')),
                items: _transport
                    .map((t) => DropdownMenuItem(value: t, child: Text(context.tr(_label(t)))))
                    .toList(),
                onChanged: (v) => setState(() => _mode = v ?? 'flight'),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: _hotel,
                onChanged: (v) => setState(() => _hotel = v),
                title: Text(context.tr('Hotel needed'), style: context.text.bodyMedium),
              ),

              const SizedBox(height: AppSpacing.sm),
              Text(context.tr('Requested advance (IDR)'), style: context.text.labelLarge),
              const SizedBox(height: AppSpacing.sm),
              _Money(controller: _transportCost, label: context.tr('Transportation'), onChanged: () => setState(() {})),
              const SizedBox(height: AppSpacing.sm),
              _Money(controller: _hotelCost, label: context.tr('Hotel'), onChanged: () => setState(() {})),
              const SizedBox(height: AppSpacing.sm),
              _Money(controller: _allowance, label: context.tr('Allowance'), onChanged: () => setState(() {})),
              const SizedBox(height: AppSpacing.sm),
              Text('${context.tr('Total')}: IDR ${_total.round()}',
                  style: context.text.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
              Text(context.tr('Finance may adjust this amount.'),
                  style: context.text.labelSmall?.copyWith(color: c.mutedForeground)),

              const SizedBox(height: AppSpacing.lg),
              AppButton(
                label: _busy ? context.tr('Submitting…') : context.tr('Submit for approval'),
                onPressed: _busy ? null : _submit,
              ),
              const SizedBox(height: AppSpacing.md),
            ],
          ),
        ),
      ),
    );
  }

  static String _label(String t) => switch (t) {
        'flight' => 'Flight',
        'train' => 'Train',
        'car' => 'Car',
        'bus' => 'Bus',
        _ => 'Other',
      };
}

class _DateField extends StatelessWidget {
  const _DateField({required this.label, required this.value, required this.onTap});
  final String label;
  final DateTime value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: InputDecorator(
        decoration: InputDecoration(labelText: label),
        child: Text('${value.day}/${value.month}/${value.year}', style: context.text.bodyMedium),
      ),
    );
  }
}

class _Money extends StatelessWidget {
  const _Money({required this.controller, required this.label, required this.onChanged});
  final TextEditingController controller;
  final String label;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: TextInputType.number,
      onChanged: (_) => onChanged(),
      decoration: InputDecoration(labelText: label, prefixText: 'IDR '),
    );
  }
}

import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import 'agreements_providers.dart';
import 'signature_processor.dart';

class AgreementsScreen extends ConsumerWidget {
  const AgreementsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(myAgreementsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Agreements')),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _Message(
          icon: Icons.error_outline,
          title: 'Could not load agreements',
          detail: '$e',
          onRetry: () => ref.invalidate(myAgreementsProvider),
        ),
        data: (items) {
          if (items.isEmpty) {
            return const _Message(
              icon: Icons.description_outlined,
              title: 'Nothing to sign',
              detail: 'Agreements sent to you for signature will appear here.',
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(myAgreementsProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (_, i) => _AgreementCard(agreement: items[i]),
            ),
          );
        },
      ),
    );
  }
}

class _AgreementCard extends ConsumerWidget {
  const _AgreementCard({required this.agreement});
  final Agreement agreement;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute<void>(builder: (_) => AgreementDetailScreen(agreement: agreement)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(agreement.title,
                        style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                  ),
                  _StatusChip(agreement: agreement),
                ],
              ),
              const SizedBox(height: 6),
              Text('From ${agreement.createdByName}',
                  style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor)),
              const SizedBox(height: 10),
              Text('${agreement.signedCount} of ${agreement.totalSigners} signed',
                  style: theme.textTheme.bodySmall),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.agreement});
  final Agreement agreement;

  @override
  Widget build(BuildContext context) {
    final (String label, Color color) = switch (agreement.myStatus) {
      'signed' => ('Signed', Colors.green),
      'declined' => ('Declined', Colors.red),
      _ when agreement.canSign => ('Action needed', Colors.orange),
      _ => ('Awaiting', Colors.grey),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
      child: Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }
}

/// Reads the agreement, then captures a signature at the bottom — the order the
/// signer needs it in, and the order that makes the consent meaningful.
class AgreementDetailScreen extends ConsumerStatefulWidget {
  const AgreementDetailScreen({super.key, required this.agreement});
  final Agreement agreement;

  @override
  ConsumerState<AgreementDetailScreen> createState() => _AgreementDetailScreenState();
}

class _AgreementDetailScreenState extends ConsumerState<AgreementDetailScreen> {
  Uint8List? _signature;
  bool _busy = false;
  String? _error;

  Future<void> _capture(ImageSource source) async {
    setState(() { _error = null; _busy = true; });
    try {
      final picked = await ImagePicker().pickImage(
        source: source,
        // Enough detail for the strokes without shipping a 12MP photo.
        maxWidth: 1600,
        imageQuality: 92,
      );
      if (picked == null) { setState(() => _busy = false); return; }

      final png = await SignatureProcessor.extractSignature(await picked.readAsBytes());
      if (!mounted) return;
      setState(() {
        _busy = false;
        if (png == null) {
          _error = 'No signature was found. Sign in dark ink on plain paper and fill the frame.';
        } else {
          _signature = png;
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() { _busy = false; _error = 'Could not read that image: $e'; });
    }
  }

  Future<void> _submit() async {
    final sig = _signature;
    if (sig == null) return;
    setState(() { _busy = true; _error = null; });
    try {
      await ref.read(agreementsRepositoryProvider).sign(widget.agreement.id, sig);
      ref.invalidate(myAgreementsProvider);
      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Agreement signed')),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() { _busy = false; _error = '$e'; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final a = widget.agreement;

    return Scaffold(
      appBar: AppBar(title: Text(a.title)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(a.body, style: theme.textTheme.bodyMedium?.copyWith(height: 1.5)),
          const Divider(height: 40),

          if (a.isSigned)
            Row(children: [
              const Icon(Icons.verified, color: Colors.green),
              const SizedBox(width: 8),
              Expanded(child: Text('You signed this agreement'
                  '${a.mySignedAt != null ? ' on ${a.mySignedAt!.toLocal().toString().split('.').first}' : ''}.')),
            ])
          else if (!a.canSign)
            Text('This agreement is not open for your signature.',
                style: theme.textTheme.bodyMedium?.copyWith(color: theme.hintColor))
          else ...[
            Text('Signature', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Text(
              'Sign on a plain sheet of paper, then photograph it. The background is '
              'removed automatically — check the result before you submit.',
              style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor),
            ),
            const SizedBox(height: 14),

            if (_signature != null)
              Container(
                height: 120,
                width: double.infinity,
                decoration: BoxDecoration(
                  border: Border.all(color: theme.dividerColor),
                  borderRadius: BorderRadius.circular(12),
                  color: Colors.white,
                ),
                padding: const EdgeInsets.all(8),
                child: Image.memory(_signature!, fit: BoxFit.contain),
              ),
            if (_signature != null) const SizedBox(height: 12),

            Row(children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: _busy ? null : () => _capture(ImageSource.camera),
                  icon: const Icon(Icons.camera_alt_outlined),
                  label: Text(_signature == null ? 'Scan signature' : 'Retake'),
                ),
              ),
              const SizedBox(width: 10),
              IconButton.outlined(
                onPressed: _busy ? null : () => _capture(ImageSource.gallery),
                icon: const Icon(Icons.photo_library_outlined),
                tooltip: 'Choose a photo',
              ),
            ]),

            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: TextStyle(color: theme.colorScheme.error)),
            ],

            const SizedBox(height: 20),
            FilledButton(
              onPressed: (_signature == null || _busy) ? null : _submit,
              child: _busy
                  ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Sign agreement'),
            ),
            const SizedBox(height: 8),
            Text(
              'Signing records your name, the time, and your device details against this document.',
              style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}

class _Message extends StatelessWidget {
  const _Message({required this.icon, required this.title, required this.detail, this.onRetry});
  final IconData icon;
  final String title;
  final String detail;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 44, color: theme.hintColor),
            const SizedBox(height: 14),
            Text(title, style: theme.textTheme.titleMedium),
            const SizedBox(height: 6),
            Text(detail, textAlign: TextAlign.center,
                style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor)),
            if (onRetry != null) ...[
              const SizedBox(height: 16),
              OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
            ],
          ],
        ),
      ),
    );
  }
}

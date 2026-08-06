import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/i18n/app_i18n.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/app_spacing.dart';
import 'assistant_providers.dart';

/// Starter questions an employee can actually get answered — everything the
/// assistant returns is scoped to them by the server.
const _suggestions = [
  'How many leave days do I have left?',
  'What is my attendance this month?',
  'How does the travel advance work?',
  'How is my pay calculated?',
];

/// The in-app assistant as a bottom sheet, reachable from any tab.
class AssistantSheet extends ConsumerStatefulWidget {
  const AssistantSheet({super.key});

  @override
  ConsumerState<AssistantSheet> createState() => _AssistantSheetState();
}

class _AssistantSheetState extends ConsumerState<AssistantSheet> {
  final _controller = TextEditingController();
  final _scroll = ScrollController();
  final List<AssistantTurn> _turns = [];
  bool _busy = false;

  @override
  void dispose() {
    _controller.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _send(String text) async {
    final q = text.trim();
    if (q.isEmpty || _busy) return;
    _controller.clear();
    final history = List<AssistantTurn>.from(_turns);
    setState(() {
      _turns.add(AssistantTurn(role: 'user', content: q));
      _busy = true;
    });
    _toBottom();
    try {
      final a = await ref.read(assistantRepositoryProvider).ask(q, history);
      if (!mounted) return;
      setState(() => _turns.add(AssistantTurn(role: 'assistant', content: a.reply, provider: a.provider)));
    } catch (e) {
      if (!mounted) return;
      setState(() => _turns.add(AssistantTurn(
          role: 'assistant',
          content: context.tr('The assistant is unavailable right now.'),
          failed: true)));
    } finally {
      if (mounted) setState(() => _busy = false);
      _toBottom();
    }
  }

  void _toBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: BoxDecoration(
          color: c.background,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            const SizedBox(height: AppSpacing.sm),
            Container(width: 40, height: 4,
              decoration: BoxDecoration(color: c.border, borderRadius: BorderRadius.circular(2))),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Row(
                children: [
                  Container(
                    width: 34, height: 34,
                    decoration: BoxDecoration(color: c.tint(c.primary, 0.12), shape: BoxShape.circle),
                    child: Icon(Icons.smart_toy_rounded, size: 18, color: c.primary),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(context.tr('Assistant'), style: context.text.titleMedium),
                        Text(context.tr('Ask about your work'),
                            style: context.text.labelSmall?.copyWith(color: c.mutedForeground)),
                      ],
                    ),
                  ),
                  IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.of(context).pop()),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView(
                controller: _scroll,
                padding: const EdgeInsets.all(AppSpacing.md),
                children: [
                  if (_turns.isEmpty) ...[
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(color: c.surfaceAlt, borderRadius: AppRadius.rLg),
                      child: Text(
                        context.tr('Ask about your leave, attendance, pay or travel — or how something in the app works. I only see what you are allowed to see.'),
                        style: context.text.bodySmall?.copyWith(color: c.mutedForeground),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Wrap(
                      spacing: 8, runSpacing: 8,
                      children: _suggestions
                          .map((q) => ActionChip(label: Text(context.tr(q)), onPressed: () => _send(q)))
                          .toList(),
                    ),
                  ],
                  ..._turns.map((t) => _Bubble(turn: t)),
                  if (_busy)
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(top: AppSpacing.sm),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(color: c.surfaceAlt, borderRadius: AppRadius.rLg),
                        child: Row(mainAxisSize: MainAxisSize.min, children: [
                          const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)),
                          const SizedBox(width: AppSpacing.sm),
                          Text(context.tr('Thinking…'),
                              style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
                        ]),
                      ),
                    ),
                ],
              ),
            ),
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      enabled: !_busy,
                      textInputAction: TextInputAction.send,
                      onSubmitted: _send,
                      decoration: InputDecoration(
                        hintText: context.tr('Ask a question…'),
                        isDense: true,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  IconButton.filled(
                    onPressed: _busy ? null : () => _send(_controller.text),
                    icon: const Icon(Icons.send_rounded, size: 18),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.turn});
  final AssistantTurn turn;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final mine = turn.role == 'user';
    return Align(
      alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(top: AppSpacing.sm),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        decoration: BoxDecoration(
          color: mine ? c.primary : turn.failed ? c.tint(c.danger, 0.12) : c.surfaceAlt,
          borderRadius: AppRadius.rLg,
        ),
        child: Text(
          turn.content,
          style: context.text.bodyMedium?.copyWith(
            color: mine ? c.primaryForeground : turn.failed ? c.danger : c.foreground,
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'memo_compose_screen.dart';
import 'memos_providers.dart';

/// Inbox and Sent. Memos travel sideways between departments, so this is not a
/// reporting-line view — anything addressed to this person turns up here,
/// whoever they are and wherever they sit.
class MemosScreen extends ConsumerStatefulWidget {
  const MemosScreen({super.key});

  @override
  ConsumerState<MemosScreen> createState() => _MemosScreenState();
}

class _MemosScreenState extends ConsumerState<MemosScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabs = TabController(length: 2, vsync: this);

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  void _refresh() {
    ref.invalidate(inboxMemosProvider);
    ref.invalidate(sentMemosProvider);
    ref.invalidate(unreadMemoCountProvider);
  }

  @override
  Widget build(BuildContext context) {
    final unread = ref.watch(unreadMemoCountProvider).valueOrNull ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Memos'),
        bottom: TabBar(
          controller: _tabs,
          tabs: [
            Tab(text: unread > 0 ? 'Inbox ($unread)' : 'Inbox'),
            const Tab(text: 'Sent'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final sent = await Navigator.of(context).push<bool>(
            MaterialPageRoute(builder: (_) => const MemoComposeScreen()),
          );
          if (sent == true) {
            _refresh();
            _tabs.animateTo(1);
          }
        },
        icon: const Icon(Icons.edit_outlined),
        label: const Text('New memo'),
      ),
      body: TabBarView(
        controller: _tabs,
        children: [
          _MemoList(provider: inboxMemosProvider, box: 'inbox', onChanged: _refresh),
          _MemoList(provider: sentMemosProvider, box: 'sent', onChanged: _refresh),
        ],
      ),
    );
  }
}

class _MemoList extends ConsumerWidget {
  const _MemoList({required this.provider, required this.box, required this.onChanged});
  final ProviderListenable<AsyncValue<List<Memo>>> provider;
  final String box;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(provider);
    final theme = Theme.of(context);

    return async.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.error_outline, size: 42, color: theme.hintColor),
            const SizedBox(height: 12),
            Text('Could not load memos', style: theme.textTheme.titleMedium),
            const SizedBox(height: 6),
            Text('$e', textAlign: TextAlign.center, style: theme.textTheme.bodySmall),
            const SizedBox(height: 14),
            OutlinedButton(onPressed: onChanged, child: const Text('Retry')),
          ]),
        ),
      ),
      data: (items) {
        if (items.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(box == 'inbox' ? Icons.inbox_outlined : Icons.send_outlined,
                    size: 44, color: theme.hintColor),
                const SizedBox(height: 14),
                Text(box == 'inbox' ? 'No memos yet' : 'Nothing sent yet',
                    style: theme.textTheme.titleMedium),
                const SizedBox(height: 6),
                Text(
                  box == 'inbox'
                      ? 'Memos sent to you appear here.'
                      : 'Memos you send appear here, with who has read them.',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor),
                ),
              ]),
            ),
          );
        }
        return RefreshIndicator(
          onRefresh: () async => onChanged(),
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 96),
            itemCount: items.length,
            separatorBuilder: (_, _) => const SizedBox(height: 8),
            itemBuilder: (_, i) => _MemoTile(memo: items[i], box: box, onChanged: onChanged),
          ),
        );
      },
    );
  }
}

class _MemoTile extends ConsumerWidget {
  const _MemoTile({required this.memo, required this.box, required this.onChanged});
  final Memo memo;
  final String box;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final unread = box == 'inbox' && memo.unread;

    return Card(
      elevation: 0,
      color: unread ? theme.colorScheme.primary.withValues(alpha: 0.06) : null,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: theme.dividerColor.withValues(alpha: 0.6)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        leading: Icon(
          unread ? Icons.mark_email_unread_outlined : Icons.mail_outline,
          color: unread ? theme.colorScheme.primary : theme.hintColor,
        ),
        title: Text(
          memo.subject,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(fontWeight: unread ? FontWeight.w700 : FontWeight.w500),
        ),
        subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const SizedBox(height: 2),
          Text(
            box == 'sent'
                ? 'To ${memo.recipients.map((r) => r.name).join(', ')}'
                : '${memo.senderName}${memo.senderDepartment.isNotEmpty ? ' · ${memo.senderDepartment}' : ''}',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.bodySmall,
          ),
          if (memo.isOversightCopy) ...[
            const SizedBox(height: 4),
            Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.visibility_outlined, size: 13, color: theme.hintColor),
              const SizedBox(width: 4),
              Text('Oversight copy',
                  style: theme.textTheme.labelSmall?.copyWith(color: theme.hintColor)),
            ]),
          ],
        ]),
        trailing: Text(_ago(memo.createdAt),
            style: theme.textTheme.labelSmall?.copyWith(color: theme.hintColor)),
        onTap: () async {
          // Opening is what clears the unread badge, so the list is refreshed
          // afterwards rather than optimistically.
          if (unread) {
            await ref.read(memosRepositoryProvider).markRead(memo.id).catchError((_) {});
            onChanged();
          }
          if (!context.mounted) return;
          await Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => MemoDetailScreen(memo: memo, box: box)),
          );
        },
      ),
    );
  }
}

class MemoDetailScreen extends StatelessWidget {
  const MemoDetailScreen({super.key, required this.memo, required this.box});
  final Memo memo;
  final String box;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Memo')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text(memo.subject, style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text(
            '${memo.senderName}'
            '${memo.senderDepartment.isNotEmpty ? ' · ${memo.senderDepartment}' : ''}'
            ' · ${_ago(memo.createdAt)}',
            style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor),
          ),
          const Divider(height: 30),
          Text(memo.body, style: theme.textTheme.bodyMedium?.copyWith(height: 1.5)),
          const SizedBox(height: 28),

          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.45),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('RECIPIENTS',
                  style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.hintColor, fontWeight: FontWeight.w700, letterSpacing: 0.6)),
              const SizedBox(height: 8),
              ...memo.recipients.map((r) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 3),
                    child: Row(children: [
                      Expanded(
                        child: Text(
                          '${r.name}${r.department.isNotEmpty ? ' · ${r.department}' : ''}',
                          style: theme.textTheme.bodySmall,
                        ),
                      ),
                      Text(r.readAt != null ? 'Read' : 'Unread',
                          style: theme.textTheme.labelSmall?.copyWith(
                              color: r.readAt != null ? Colors.green : theme.hintColor)),
                    ]),
                  )),
              if (memo.oversightCount > 0) ...[
                const Divider(height: 20),
                Row(children: [
                  Icon(Icons.verified_user_outlined, size: 15, color: theme.hintColor),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Copied to ${memo.oversightCount} administrator'
                      '${memo.oversightCount > 1 ? 's' : ''} for oversight.',
                      style: theme.textTheme.labelSmall?.copyWith(color: theme.hintColor),
                    ),
                  ),
                ]),
              ],
            ]),
          ),
        ],
      ),
    );
  }
}

String _ago(DateTime d) {
  final diff = DateTime.now().difference(d);
  if (diff.inMinutes < 1) return 'now';
  if (diff.inMinutes < 60) return '${diff.inMinutes}m';
  if (diff.inHours < 24) return '${diff.inHours}h';
  if (diff.inDays < 7) return '${diff.inDays}d';
  return '${d.day}/${d.month}';
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/di/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/ambient_background.dart';
import '../../core/widgets/app_card.dart';
import '../../core/widgets/app_states.dart';
import '../../core/widgets/skeleton.dart';
import '../../core/i18n/app_i18n.dart';

/// One in-app notification.
class AppNotification {
  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.createdAt,
    required this.isRead,
  });

  final String id;
  final String title;
  final String body;
  final DateTime createdAt;
  final bool isRead;

  static AppNotification fromJson(Map<String, dynamic> j) => AppNotification(
        id: j['id'].toString(),
        title: j['title']?.toString() ?? 'Notification',
        body: j['body']?.toString() ?? '',
        createdAt: DateTime.tryParse(j['createdAt']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
        isRead: j['readAt'] != null || j['isRead'] == true,
      );

  /// Picks an icon from the wording, since the API does not yet send a
  /// category the client can rely on.
  IconData get icon {
    final t = '$title $body'.toLowerCase();
    if (t.contains('leave')) return Icons.event_available_rounded;
    if (t.contains('task')) return Icons.checklist_rounded;
    if (t.contains('attendance') || t.contains('check')) return Icons.access_time_filled_rounded;
    return Icons.notifications_rounded;
  }
}

final notificationsProvider = FutureProvider<List<AppNotification>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final env = await api.getEnvelope('/notifications', query: {'limit': '50'});
  final rows = (env.data is List) ? env.data as List : const [];
  return rows.map((e) => AppNotification.fromJson((e as Map).cast<String, dynamic>())).toList();
});

final unreadCountProvider = FutureProvider<int>((ref) async {
  final api = ref.watch(apiClientProvider);
  final data = await api.get('/notifications/unread-count');
  if (data is int) return data;
  if (data is Map) return (data['count'] as num?)?.toInt() ?? 0;
  return 0;
});

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  Future<void> _markAll(WidgetRef ref) async {
    await ref.read(apiClientProvider).patch('/notifications/read-all');
    ref.invalidate(notificationsProvider);
    ref.invalidate(unreadCountProvider);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = context.colors;
    final async = ref.watch(notificationsProvider);
    final unread = ref.watch(unreadCountProvider).valueOrNull ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: Text(context.tr('Notifications')),
        actions: [
          if (unread > 0)
            TextButton(onPressed: () => _markAll(ref), child: Text(context.tr('Mark all read'))),
        ],
      ),
      body: AmbientBackground(
        child: RefreshIndicator(
          color: c.primary,
          onRefresh: () async {
            ref.invalidate(notificationsProvider);
            ref.invalidate(unreadCountProvider);
          },
          child: async.when(
            loading: () => ListView(
              padding: const EdgeInsets.all(AppSpacing.screen),
              children: List.generate(
                5,
                (_) => const Padding(
                  padding: EdgeInsets.only(bottom: AppSpacing.md),
                  child: AppCard(child: Skeleton(height: 56)),
                ),
              ),
            ),
            error: (e, _) => ListView(
              padding: const EdgeInsets.all(AppSpacing.screen),
              children: [
                AppCard(
                  child: ErrorStateView(
                    message: 'Couldn’t load notifications.',
                    onRetry: () => ref.invalidate(notificationsProvider),
                  ),
                ),
              ],
            ),
            data: (rows) {
              if (rows.isEmpty) {
                return ListView(
                  padding: const EdgeInsets.all(AppSpacing.screen),
                  children: const [
                    AppCard(
                      child: EmptyState(
                        icon: Icons.notifications_none_rounded,
                        title: 'Nothing yet',
                        message: 'Leave decisions and task assignments will appear here.',
                      ),
                    ),
                  ],
                );
              }
              return ListView.separated(
                padding: const EdgeInsets.all(AppSpacing.screen),
                itemCount: rows.length,
                separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
                itemBuilder: (context, i) {
                  final n = rows[i];
                  // Unread carries a tinted icon and a dot; read is neutral, so
                  // the eye lands on what has not been seen.
                  return AppCard(
                    radius: AppRadius.rXl,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 38,
                          width: 38,
                          decoration: BoxDecoration(
                            color: n.isRead ? c.muted : c.tint(c.primary, 0.14),
                            borderRadius: AppRadius.rMd,
                          ),
                          child: Icon(n.icon, size: 19, color: n.isRead ? c.mutedForeground : c.primary),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      n.title,
                                      style: context.text.titleSmall?.copyWith(
                                        fontWeight: n.isRead ? FontWeight.w600 : FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                  if (!n.isRead)
                                    Container(
                                      height: 7,
                                      width: 7,
                                      decoration: BoxDecoration(color: c.primary, shape: BoxShape.circle),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(n.body, style: context.text.bodySmall?.copyWith(color: c.mutedForeground)),
                              const SizedBox(height: 4),
                              Text(
                                DateFormat('d MMM, h:mm a').format(n.createdAt),
                                style: context.text.labelSmall?.copyWith(color: c.mutedForeground),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              );
            },
          ),
        ),
      ),
    );
  }
}

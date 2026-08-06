import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/di/providers.dart';

/// One turn of the assistant conversation.
class AssistantTurn {
  const AssistantTurn({required this.role, required this.content, this.provider, this.failed = false});
  final String role; // 'user' | 'assistant'
  final String content;
  final String? provider;
  final bool failed;
}

class AssistantAnswer {
  const AssistantAnswer({required this.reply, required this.provider, required this.toolsUsed});
  final String reply;
  final String provider;
  final List<String> toolsUsed;
}

class AssistantRepository {
  AssistantRepository(this._ref);
  final Ref _ref;

  /// False when no provider key is configured — the launcher stays hidden
  /// rather than offering a bot that cannot answer.
  Future<bool> available() async {
    try {
      final res = await _ref.read(apiClientProvider).get('/assistant/status');
      return (res as Map<String, dynamic>)['available'] as bool? ?? false;
    } catch (_) {
      return false;
    }
  }

  Future<AssistantAnswer> ask(String question, List<AssistantTurn> history) async {
    final res = await _ref.read(apiClientProvider).post('/assistant/chat', body: {
      'question': question,
      'history': history
          .where((t) => !t.failed)
          .map((t) => {'role': t.role, 'content': t.content})
          .toList(),
    });
    final m = res as Map<String, dynamic>;
    return AssistantAnswer(
      reply: m['reply']?.toString() ?? '',
      provider: m['provider']?.toString() ?? '',
      toolsUsed: ((m['toolsUsed'] as List?) ?? const []).map((e) => e.toString()).toList(),
    );
  }
}

final assistantRepositoryProvider = Provider((ref) => AssistantRepository(ref));

final assistantAvailableProvider = FutureProvider<bool>(
  (ref) => ref.read(assistantRepositoryProvider).available(),
);

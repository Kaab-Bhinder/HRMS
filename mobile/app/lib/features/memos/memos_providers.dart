import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/di/providers.dart';

/// One person a memo was addressed to, and whether they have opened it.
class MemoRecipient {
  const MemoRecipient({required this.name, required this.department, this.readAt});
  final String name;
  final String department;
  final DateTime? readAt;

  static MemoRecipient fromJson(Map<String, dynamic> j) => MemoRecipient(
        name: (j['name'] ?? '') as String,
        department: (j['department'] ?? '') as String,
        readAt: j['readAt'] == null ? null : DateTime.tryParse(j['readAt'] as String),
      );
}

class Memo {
  const Memo({
    required this.id,
    required this.subject,
    required this.body,
    required this.senderName,
    required this.senderDepartment,
    required this.createdAt,
    required this.recipients,
    required this.oversightCount,
    required this.isMine,
    this.readAt,
    this.myRole,
  });

  final String id;
  final String subject;
  final String body;
  final String senderName;
  final String senderDepartment;
  final DateTime createdAt;
  final List<MemoRecipient> recipients;
  final int oversightCount;
  final bool isMine;
  final DateTime? readAt;

  /// sender | to | oversight — what this viewer is to the memo.
  final String? myRole;

  bool get unread => readAt == null && !isMine;
  bool get isOversightCopy => myRole == 'oversight';

  static Memo fromJson(Map<String, dynamic> j) => Memo(
        id: j['id'] as String,
        subject: (j['subject'] ?? '') as String,
        body: (j['body'] ?? '') as String,
        senderName: (j['senderName'] ?? '') as String,
        senderDepartment: (j['senderDepartment'] ?? '') as String,
        createdAt: DateTime.tryParse((j['createdAt'] ?? '') as String) ?? DateTime.now(),
        recipients: ((j['recipients'] as List?) ?? const [])
            .map((e) => MemoRecipient.fromJson(e as Map<String, dynamic>))
            .toList(),
        oversightCount: (j['oversightCount'] ?? 0) as int,
        isMine: (j['isMine'] ?? false) as bool,
        readAt: j['readAt'] == null ? null : DateTime.tryParse(j['readAt'] as String),
        myRole: j['myRole'] as String?,
      );
}

class MemoDepartment {
  const MemoDepartment({required this.id, required this.name, required this.memberCount});
  final String id;
  final String name;
  final int memberCount;

  static MemoDepartment fromJson(Map<String, dynamic> j) => MemoDepartment(
        id: j['id'] as String,
        name: (j['name'] ?? '') as String,
        memberCount: (j['memberCount'] ?? 0) as int,
      );
}

class MemoPerson {
  const MemoPerson({
    required this.id,
    required this.name,
    required this.department,
    required this.designation,
  });
  final String id;
  final String name;
  final String department;
  final String designation;

  String get subtitle => [designation, department].where((s) => s.isNotEmpty).join(' · ');

  static MemoPerson fromJson(Map<String, dynamic> j) => MemoPerson(
        id: j['id'] as String,
        name: (j['name'] ?? '') as String,
        department: (j['department'] ?? '') as String,
        designation: (j['designation'] ?? '') as String,
      );
}

/// Either half of the two-step recipient picker: departments, or the people
/// inside one. A search term returns people regardless of department.
class Directory {
  const Directory({required this.departments, required this.people});
  final List<MemoDepartment> departments;
  final List<MemoPerson> people;

  bool get isDepartments => departments.isNotEmpty && people.isEmpty;
}

class MemosRepository {
  MemosRepository(this._ref);
  final Ref _ref;

  Future<List<Memo>> list({required String box}) async {
    final res = await _ref.read(apiClientProvider).get('/memos', query: {'box': box, 'limit': 100});
    final rows = (res as List?) ?? const [];
    return rows.map((e) => Memo.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<int> unreadCount() async {
    final res = await _ref.read(apiClientProvider).get('/memos/unread-count');
    return ((res as Map<String, dynamic>?)?['count'] ?? 0) as int;
  }

  Future<Directory> directory({String? departmentId, String? search}) async {
    final res = await _ref.read(apiClientProvider).get('/memos/directory', query: {
      if (departmentId != null && departmentId.isNotEmpty) 'departmentId': departmentId,
      if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
    });
    final map = (res as Map<String, dynamic>?) ?? const {};
    return Directory(
      departments: ((map['departments'] as List?) ?? const [])
          .map((e) => MemoDepartment.fromJson(e as Map<String, dynamic>))
          .toList(),
      people: ((map['people'] as List?) ?? const [])
          .map((e) => MemoPerson.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Future<void> send({
    required String subject,
    required String body,
    required List<String> recipientEmployeeIds,
  }) =>
      _ref.read(apiClientProvider).post('/memos', body: {
        'subject': subject,
        'body': body,
        'recipientEmployeeIds': recipientEmployeeIds,
      });

  Future<void> markRead(String id) =>
      _ref.read(apiClientProvider).post('/memos/$id/read', body: const {});
}

final memosRepositoryProvider = Provider<MemosRepository>(MemosRepository.new);

final inboxMemosProvider =
    FutureProvider.autoDispose<List<Memo>>((ref) => ref.read(memosRepositoryProvider).list(box: 'inbox'));

final sentMemosProvider =
    FutureProvider.autoDispose<List<Memo>>((ref) => ref.read(memosRepositoryProvider).list(box: 'sent'));

final unreadMemoCountProvider =
    FutureProvider.autoDispose<int>((ref) => ref.read(memosRepositoryProvider).unreadCount());

/// Directory lookups are keyed by department + search so switching between
/// them is instant on the way back, and each distinct query is fetched once.
final memoDirectoryProvider =
    FutureProvider.autoDispose.family<Directory, ({String? departmentId, String search})>(
  (ref, q) => ref
      .read(memosRepositoryProvider)
      .directory(departmentId: q.departmentId, search: q.search),
);

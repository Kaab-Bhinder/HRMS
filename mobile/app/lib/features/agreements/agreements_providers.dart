import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/di/providers.dart';

/// An agreement the signed-in employee is a party to.
class Agreement {
  const Agreement({
    required this.id,
    required this.title,
    required this.body,
    required this.status,
    required this.myStatus,
    required this.canSign,
    required this.createdByName,
    required this.signedCount,
    required this.totalSigners,
    this.mySignedAt,
  });

  final String id;
  final String title;
  final String body;

  /// sent | partially_signed | completed | declined | cancelled
  final String status;

  /// pending | viewed | signed | declined — this employee's own state.
  final String myStatus;
  final bool canSign;
  final String createdByName;
  final int signedCount;
  final int totalSigners;
  final DateTime? mySignedAt;

  bool get isSigned => myStatus == 'signed';

  static Agreement fromJson(Map<String, dynamic> j) => Agreement(
        id: j['id'] as String,
        title: (j['title'] ?? '') as String,
        body: (j['body'] ?? '') as String,
        status: (j['status'] ?? '') as String,
        myStatus: (j['myStatus'] ?? 'pending') as String,
        canSign: (j['canSign'] ?? false) as bool,
        createdByName: (j['createdByName'] ?? '') as String,
        signedCount: (j['signedCount'] ?? 0) as int,
        totalSigners: (j['totalSigners'] ?? 0) as int,
        mySignedAt: j['mySignedAt'] == null ? null : DateTime.tryParse(j['mySignedAt'] as String),
      );
}

class AgreementsRepository {
  AgreementsRepository(this._ref);
  final Ref _ref;

  Future<List<Agreement>> mine() async {
    final res = await _ref.read(apiClientProvider).get('/agreements/mine');
    final rows = (res as List?) ?? const [];
    return rows.map((e) => Agreement.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// Uploads the cleaned signature. The server accepts a PNG data URL only, and
  /// re-checks the magic number — the client is not trusted about the format.
  Future<void> sign(String agreementId, Uint8List transparentPng) async {
    await _ref.read(apiClientProvider).post(
      '/agreements/$agreementId/sign',
      body: {'signaturePng': 'data:image/png;base64,${base64Encode(transparentPng)}'},
    );
  }
}

final agreementsRepositoryProvider =
    Provider<AgreementsRepository>(AgreementsRepository.new);

final myAgreementsProvider = FutureProvider.autoDispose<List<Agreement>>(
  (ref) => ref.read(agreementsRepositoryProvider).mine(),
);

/// Anything still waiting on this employee — drives the badge on the shell.
final pendingSignatureCountProvider = Provider.autoDispose<int>((ref) {
  final async = ref.watch(myAgreementsProvider);
  return async.maybeWhen(
    data: (list) => list.where((a) => a.canSign).length,
    orElse: () => 0,
  );
});

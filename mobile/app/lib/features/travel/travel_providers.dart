import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/di/providers.dart';
import '../../core/network/json_num.dart';

/// One business-travel request as the employee sees it.
class TravelTrip {
  const TravelTrip({
    required this.id,
    required this.reference,
    required this.destination,
    required this.purpose,
    required this.startDate,
    required this.endDate,
    required this.status,
    required this.durationDays,
    required this.advanceTotal,
    required this.actualTotal,
    this.clientName,
    this.settlementAmount,
  });

  final String id;
  final String reference;
  final String destination;
  final String purpose;
  final DateTime startDate;
  final DateTime endDate;

  /// draft | submitted | approved | rejected | advance_paid |
  /// realization_submitted | verified | completed | cancelled
  final String status;
  final int durationDays;
  final double advanceTotal;
  final double actualTotal;
  final String? clientName;

  /// Positive: the company owes the traveller. Negative: unspent advance
  /// must be returned. Null until finance has verified the report.
  final double? settlementAmount;

  static TravelTrip fromJson(Map<String, dynamic> j) => TravelTrip(
        id: j['id'].toString(),
        reference: j['reference']?.toString() ?? '',
        destination: j['destinationCity']?.toString() ?? '',
        purpose: j['purpose']?.toString() ?? '',
        startDate: DateTime.parse(j['startDate'].toString()),
        endDate: DateTime.parse(j['endDate'].toString()),
        status: j['status']?.toString() ?? 'draft',
        durationDays: (asDoubleOrNull(j['durationDays']) ?? 1).round(),
        advanceTotal: asDouble(j['advanceTotal']),
        actualTotal: asDouble(j['actualTotal']),
        clientName: j['clientName']?.toString(),
        settlementAmount: asDoubleOrNull(j['settlementAmount']),
      );

  /// The report can be filed once the trip is approved or the advance is out.
  bool get canFileReport => status == 'approved' || status == 'advance_paid';
  bool get isOpen => status != 'completed' && status != 'cancelled' && status != 'rejected';
}

class TravelRepository {
  TravelRepository(this._ref);
  final Ref _ref;

  Future<List<TravelTrip>> myTrips() async {
    final res = await _ref.read(apiClientProvider).get('/travel', query: {'limit': 50});
    final rows = (res as List?) ?? const [];
    return rows.map((e) => TravelTrip.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<TravelTrip> create({
    required String destination,
    required String purpose,
    required DateTime start,
    required DateTime end,
    required String transportation,
    required bool hotelNeeded,
    double transport = 0,
    double hotel = 0,
    double allowance = 0,
  }) async {
    final res = await _ref.read(apiClientProvider).post('/travel', body: {
      'destinationCity': destination,
      'purpose': purpose,
      'startDate': start.toIso8601String().substring(0, 10),
      'endDate': end.toIso8601String().substring(0, 10),
      'transportation': transportation,
      'hotelNeeded': hotelNeeded,
      'estimatedCost': transport + hotel + allowance,
      'requestedTransport': transport,
      'requestedHotel': hotel,
      'requestedAllowance': allowance,
    });
    return TravelTrip.fromJson(res as Map<String, dynamic>);
  }

  Future<void> submit(String id) => _ref.read(apiClientProvider).post('/travel/$id/submit', body: const {});

  Future<void> fileReport(
    String id, {
    DateTime? departure,
    DateTime? returned,
    String? transportUsed,
    String? hotelUsed,
    double transport = 0,
    double hotel = 0,
    double allowance = 0,
    List<Map<String, String>> activities = const [],
  }) =>
      _ref.read(apiClientProvider).post('/travel/$id/realization', body: {
        if (departure != null) 'actualDepartureDate': departure.toIso8601String().substring(0, 10),
        if (returned != null) 'actualReturnDate': returned.toIso8601String().substring(0, 10),
        if (transportUsed != null && transportUsed.isNotEmpty) 'transportUsed': transportUsed,
        if (hotelUsed != null && hotelUsed.isNotEmpty) 'hotelUsed': hotelUsed,
        'actualTransport': transport,
        'actualHotel': hotel,
        'actualAllowance': allowance,
        if (activities.isNotEmpty) 'activities': activities,
      });
}

final travelRepositoryProvider = Provider((ref) => TravelRepository(ref));

final myTripsProvider = FutureProvider.autoDispose<List<TravelTrip>>(
  (ref) => ref.read(travelRepositoryProvider).myTrips(),
);

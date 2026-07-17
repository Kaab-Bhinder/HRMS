import '../../../core/widgets/status_pill.dart';

/// Presentation helpers shared by the task list and detail sheet.
({String label, PillTone tone}) statusMeta(String status) {
  switch (status) {
    case 'in_progress':
      return (label: 'In progress', tone: PillTone.info);
    case 'in_review':
      return (label: 'In review', tone: PillTone.accent);
    case 'blocked':
      return (label: 'Blocked', tone: PillTone.danger);
    case 'done':
      return (label: 'Done', tone: PillTone.success);
    case 'cancelled':
      return (label: 'Cancelled', tone: PillTone.neutral);
    case 'backlog':
      return (label: 'Backlog', tone: PillTone.neutral);
    default:
      return (label: 'To do', tone: PillTone.neutral);
  }
}

({String label, PillTone tone}) priorityMeta(String priority) {
  switch (priority) {
    case 'urgent':
      return (label: 'Urgent', tone: PillTone.danger);
    case 'high':
      return (label: 'High', tone: PillTone.warning);
    case 'low':
      return (label: 'Low', tone: PillTone.neutral);
    default:
      return (label: 'Medium', tone: PillTone.info);
  }
}

/// Time remaining until a due date, coloured by urgency. Null when no due date.
({String label, PillTone tone})? timeLeftMeta(DateTime? dueDate, bool isDone) {
  if (dueDate == null) return null;
  if (isDone) return (label: 'Completed', tone: PillTone.success);
  final diff = dueDate.difference(DateTime.now());
  final abs = diff.abs();
  final days = abs.inDays;
  final hours = abs.inHours % 24;
  final human = days >= 1 ? '${days}d ${hours}h' : '${abs.inHours}h';
  if (diff.isNegative) return (label: 'Overdue $human', tone: PillTone.danger);
  if (diff.inHours < 48) return (label: '$human left', tone: PillTone.warning);
  return (label: '$human left', tone: PillTone.neutral);
}

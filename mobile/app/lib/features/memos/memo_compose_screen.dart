import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'memos_providers.dart';

/// Compose, with the two-step recipient picker: departments first, then the
/// people inside one. Six hundred staff cannot be a dropdown, but a search box
/// short-circuits both steps when the sender already knows the name.
class MemoComposeScreen extends ConsumerStatefulWidget {
  const MemoComposeScreen({super.key});

  @override
  ConsumerState<MemoComposeScreen> createState() => _MemoComposeScreenState();
}

class _MemoComposeScreenState extends ConsumerState<MemoComposeScreen> {
  final _subject = TextEditingController();
  final _body = TextEditingController();
  final _search = TextEditingController();

  MemoDepartment? _department;
  String _query = '';
  Timer? _debounce;
  final List<MemoPerson> _picked = [];
  bool _sending = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _search.addListener(() {
      // Debounced: the directory is a network call and every keystroke would
      // otherwise fire one.
      _debounce?.cancel();
      _debounce = Timer(const Duration(milliseconds: 300), () {
        if (mounted) setState(() => _query = _search.text.trim());
      });
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _subject.dispose();
    _body.dispose();
    _search.dispose();
    super.dispose();
  }

  bool get _canSend =>
      _subject.text.trim().isNotEmpty && _body.text.trim().isNotEmpty && _picked.isNotEmpty;

  void _toggle(MemoPerson p) => setState(() {
        final at = _picked.indexWhere((x) => x.id == p.id);
        at >= 0 ? _picked.removeAt(at) : _picked.add(p);
      });

  Future<void> _send() async {
    setState(() {
      _sending = true;
      _error = null;
    });
    try {
      await ref.read(memosRepositoryProvider).send(
            subject: _subject.text.trim(),
            body: _body.text.trim(),
            recipientEmployeeIds: _picked.map((p) => p.id).toList(),
          );
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _sending = false;
        _error = '$e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // A search term overrides the department, matching the API's own precedence.
    final key = (departmentId: _query.isEmpty ? _department?.id : null, search: _query);
    final directory = ref.watch(memoDirectoryProvider(key));

    return Scaffold(
      appBar: AppBar(
        title: const Text('New memo'),
        actions: [
          TextButton(
            onPressed: (_canSend && !_sending) ? _send : null,
            child: _sending
                ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Send'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _subject,
            onChanged: (_) => setState(() {}),
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(
              labelText: 'Subject',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _body,
            onChanged: (_) => setState(() {}),
            maxLines: 6,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(
              labelText: 'Message',
              alignLabelWithHint: true,
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 20),

          Text('To', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),

          if (_picked.isNotEmpty)
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: _picked
                  .map((p) => InputChip(
                        label: Text(p.name),
                        onDeleted: () => _toggle(p),
                      ))
                  .toList(),
            ),
          if (_picked.isNotEmpty) const SizedBox(height: 10),

          Container(
            decoration: BoxDecoration(
              border: Border.all(color: theme.dividerColor),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(6, 4, 10, 4),
                child: Row(children: [
                  if (_department != null && _query.isEmpty)
                    IconButton(
                      icon: const Icon(Icons.arrow_back),
                      tooltip: 'All departments',
                      onPressed: () => setState(() => _department = null),
                    )
                  else
                    const Padding(padding: EdgeInsets.all(12), child: Icon(Icons.search, size: 20)),
                  Expanded(
                    child: TextField(
                      controller: _search,
                      decoration: InputDecoration(
                        isDense: true,
                        border: InputBorder.none,
                        hintText: _department != null
                            ? 'Search in ${_department!.name}…'
                            : 'Search anyone by name…',
                      ),
                    ),
                  ),
                ]),
              ),
              const Divider(height: 1),
              SizedBox(
                height: 260,
                child: directory.when(
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Center(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text('Could not load the directory.\n$e',
                          textAlign: TextAlign.center, style: theme.textTheme.bodySmall),
                    ),
                  ),
                  data: (d) {
                    if (d.isDepartments) {
                      return ListView.builder(
                        itemCount: d.departments.length,
                        itemBuilder: (_, i) {
                          final dept = d.departments[i];
                          return ListTile(
                            leading: const Icon(Icons.apartment_outlined),
                            title: Text(dept.name),
                            trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                              Text('${dept.memberCount}', style: theme.textTheme.labelMedium),
                              const Icon(Icons.chevron_right),
                            ]),
                            onTap: () => setState(() => _department = dept),
                          );
                        },
                      );
                    }
                    if (d.people.isEmpty) {
                      return Center(
                        child: Text('Nobody found.', style: theme.textTheme.bodySmall),
                      );
                    }
                    return ListView.builder(
                      itemCount: d.people.length,
                      itemBuilder: (_, i) {
                        final p = d.people[i];
                        final on = _picked.any((x) => x.id == p.id);
                        return CheckboxListTile(
                          value: on,
                          onChanged: (_) => _toggle(p),
                          controlAffinity: ListTileControlAffinity.trailing,
                          title: Text(p.name),
                          subtitle: p.subtitle.isEmpty ? null : Text(p.subtitle),
                        );
                      },
                    );
                  },
                ),
              ),
            ]),
          ),

          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: TextStyle(color: theme.colorScheme.error)),
          ],

          const SizedBox(height: 14),
          Row(children: [
            Icon(Icons.verified_user_outlined, size: 15, color: theme.hintColor),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                'A copy of every memo goes to the administrator.',
                style: theme.textTheme.labelSmall?.copyWith(color: theme.hintColor),
              ),
            ),
          ]),
        ],
      ),
    );
  }
}

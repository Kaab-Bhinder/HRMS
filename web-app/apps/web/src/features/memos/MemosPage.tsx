import { useEffect, useMemo, useState } from 'react';
import {
  Send, Inbox, ArrowLeft, Search, Building2, ChevronRight, X, ShieldCheck, Mail, MailOpen, Users,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Label } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/feedback/States';
import { memosService, type Memo, type MemoDepartment, type MemoPerson } from '../../services';
import { useQuery } from '../../hooks/useQuery';
import { useToast } from '../../store/toast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { relativeTime } from '../../lib/format';

export default function MemosPage() {
  const toast = useToast();
  const [box, setBox] = useState<'inbox' | 'sent'>('inbox');
  const [composeOpen, setComposeOpen] = useState(false);
  const [open, setOpen] = useState<Memo | null>(null);

  const { data, loading, refetch } = useQuery(() => memosService.list({ box, limit: 100 }), [box]);
  const memos = data?.data ?? [];

  const openMemo = async (m: Memo) => {
    setOpen(m);
    // Reading it here is what clears the badge; the list refresh reflects it.
    if (box === 'inbox' && !m.readAt) {
      try { await memosService.markRead(m.id); refetch(); } catch { /* non-fatal */ }
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Internal Memos"
        description="Send a message or document to anyone in the company. Every memo is copied to the administrator."
        actions={<Button size="sm" onClick={() => setComposeOpen(true)}><Send className="h-4 w-4" /> New memo</Button>}
      />

      <Tabs
        tabs={[
          { value: 'inbox', label: 'Inbox', count: box === 'inbox' ? memos.length : undefined },
          { value: 'sent', label: 'Sent', count: box === 'sent' ? memos.length : undefined },
        ]}
        value={box}
        onChange={(v) => setBox(v as 'inbox' | 'sent')}
      />

      <Card>
        {loading ? (
          <div className="px-5 py-10 text-center text-muted-foreground">Loading…</div>
        ) : memos.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title={box === 'inbox' ? 'No memos yet' : 'Nothing sent yet'}
            description={
              box === 'inbox'
                ? 'Memos addressed to you — and copies of memos across the company — appear here.'
                : 'Memos you send appear here with who has read them.'
            }
            action={<Button size="sm" onClick={() => setComposeOpen(true)}><Send className="h-4 w-4" /> New memo</Button>}
          />
        ) : (
          <ul className="divide-y divide-border">
            {memos.map((m) => {
              const unread = box === 'inbox' && !m.readAt;
              return (
                <li key={m.id}>
                  <button
                    onClick={() => openMemo(m)}
                    className={`flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-surface-2/50 ${unread ? 'bg-primary/[0.04]' : ''}`}
                  >
                    <span className="mt-0.5 text-muted-foreground">
                      {unread ? <Mail className="h-4 w-4 text-primary" /> : <MailOpen className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={`truncate text-sm ${unread ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                          {m.subject}
                        </span>
                        {m.myRole === 'oversight' && (
                          <Badge tone="neutral"><ShieldCheck className="mr-1 h-3 w-3" />Oversight copy</Badge>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {box === 'sent'
                          ? `To ${m.recipients.map((r) => r.name).join(', ') || '—'}`
                          : `${m.senderName}${m.senderDepartment ? ` · ${m.senderDepartment}` : ''}`}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(m.createdAt)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {open && <MemoDetail memo={open} onClose={() => setOpen(null)} />}
      {composeOpen && (
        <ComposeModal
          onClose={() => setComposeOpen(false)}
          onSent={() => { setComposeOpen(false); setBox('sent'); refetch(); toast.success('Memo sent', 'The recipient has been notified.'); }}
        />
      )}
    </div>
  );
}

function MemoDetail({ memo, onClose }: { memo: Memo; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={memo.subject} size="lg"
      description={`${memo.senderName}${memo.senderDepartment ? ` · ${memo.senderDepartment}` : ''} · ${relativeTime(memo.createdAt)}`}
      footer={<Button variant="outline" onClick={onClose}>Close</Button>}
    >
      <div className="space-y-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{memo.body}</p>

        <div className="rounded-lg border border-border bg-surface-2/40 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recipients</p>
          <ul className="space-y-1.5">
            {memo.recipients.map((r) => (
              <li key={r.name} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{r.name}<span className="text-muted-foreground">{r.department ? ` · ${r.department}` : ''}</span></span>
                <span className="text-xs text-muted-foreground">{r.readAt ? `Read ${relativeTime(r.readAt)}` : 'Unread'}</span>
              </li>
            ))}
          </ul>
          {memo.oversightCount > 0 && (
            <p className="mt-2.5 flex items-center gap-1.5 border-t border-border pt-2.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Copied to {memo.oversightCount} administrator{memo.oversightCount > 1 ? 's' : ''} for oversight.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

/**
 * Two-step recipient picker: departments first, then the people inside one.
 * A company of 600 cannot be a flat dropdown — but a search box short-circuits
 * both steps when the sender already knows the name.
 */
function ComposeModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const toast = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [dept, setDept] = useState<MemoDepartment | null>(null);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 250);
  const [picked, setPicked] = useState<MemoPerson[]>([]);
  const [sending, setSending] = useState(false);

  const [dirs, setDirs] = useState<MemoDepartment[]>([]);
  const [people, setPeople] = useState<MemoPerson[]>([]);
  const [loadingDir, setLoadingDir] = useState(false);

  const browsing = !!dept || !!debounced.trim();

  useEffect(() => {
    let live = true;
    setLoadingDir(true);
    memosService
      .directory({ departmentId: debounced.trim() ? undefined : dept?.id, search: debounced.trim() || undefined })
      .then((res) => {
        if (!live) return;
        if (res.mode === 'departments') { setDirs(res.departments); setPeople([]); }
        else { setPeople(res.people); }
      })
      .catch(() => undefined)
      .finally(() => live && setLoadingDir(false));
    return () => { live = false; };
  }, [dept?.id, debounced]);

  const toggle = (p: MemoPerson) =>
    setPicked((prev) => (prev.some((x) => x.id === p.id) ? prev.filter((x) => x.id !== p.id) : [...prev, p]));

  const canSend = useMemo(() => subject.trim() && body.trim() && picked.length > 0, [subject, body, picked]);

  const send = async () => {
    setSending(true);
    try {
      await memosService.send({ subject: subject.trim(), body: body.trim(), recipientEmployeeIds: picked.map((p) => p.id) });
      onSent();
    } catch (e) {
      toast.error('Could not send', (e as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="New memo" size="lg"
      description="Choose a department, then the person. The administrator is copied automatically."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={send} disabled={!canSend} loading={sending}><Send className="h-4 w-4" /> Send memo</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="memo-subject" required>Subject</Label>
          <Input id="memo-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Q3 vendor figures" />
        </div>

        <div>
          <Label htmlFor="memo-body" required>Message</Label>
          <textarea
            id="memo-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="Write your message…"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-ring"
          />
        </div>

        <div>
          <Label required>Recipients</Label>

          {picked.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {picked.map((p) => (
                <span key={p.id} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                  {p.name}
                  <button onClick={() => toggle(p)} aria-label={`Remove ${p.name}`}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-border">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              {dept && !debounced.trim() && (
                <button onClick={() => setDept(null)} className="text-muted-foreground hover:text-foreground" aria-label="Back to departments">
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={dept ? `Search in ${dept.name}…` : 'Search anyone by name…'}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="max-h-56 overflow-y-auto">
              {loadingDir ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</p>
              ) : !browsing ? (
                dirs.map((d) => (
                  <button key={d.id} onClick={() => { setDept(d); setSearch(''); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-surface-2/60">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-foreground">{d.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />{d.memberCount}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))
              ) : people.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nobody found.</p>
              ) : (
                people.map((p) => {
                  const on = picked.some((x) => x.id === p.id);
                  return (
                    <button key={p.id} onClick={() => toggle(p)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-surface-2/60 ${on ? 'bg-primary/[0.06]' : ''}`}>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-[11px] font-medium text-muted-foreground">
                        {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-foreground">{p.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {[p.designation, p.department].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      {on && <Badge tone="primary">Selected</Badge>}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

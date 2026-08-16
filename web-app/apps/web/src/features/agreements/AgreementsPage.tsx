import { useMemo, useState } from 'react';
import { Plus, Send, Download, FileSignature, Copy, Check, X, Search } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Label, Select } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/feedback/States';
import {
  agreementsService, memosService, type Agreement, type AgreementTemplate, type MemoPerson,
} from '../../services';
import { downloadFile } from '../../services/client';
import { useQuery } from '../../hooks/useQuery';
import { useToast } from '../../store/toast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { relativeTime } from '../../lib/format';

const STATUS_TONE: Record<string, 'neutral' | 'primary' | 'success' | 'warning' | 'danger'> = {
  draft: 'neutral', sent: 'primary', partially_signed: 'warning',
  completed: 'success', declined: 'danger', cancelled: 'neutral',
};
const label = (s: string) => s.replace(/_/g, ' ');

export default function AgreementsPage() {
  const toast = useToast();
  const [tab, setTab] = useState('agreements');
  const [newOpen, setNewOpen] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);
  const [detail, setDetail] = useState<Agreement | null>(null);

  const { data, loading, refetch } = useQuery(() => agreementsService.list({ limit: 100 }), []);
  const { data: templates, refetch: refetchTemplates } = useQuery(() => agreementsService.templates(), []);
  const agreements = data?.data ?? [];

  const send = async (a: Agreement) => {
    try {
      const res = await agreementsService.send(a.id);
      refetch();
      const delivered = res.recipients.filter((r) => r.delivered).length;
      toast.success(
        'Signing links issued',
        delivered
          ? `${delivered} of ${res.recipients.length} notified on WhatsApp. Open the agreement to copy any link.`
          : 'WhatsApp is not configured, so no messages went out. Open the agreement to copy each link and send it yourself.',
      );
      setDetail(null);
    } catch (e) {
      toast.error('Could not send', (e as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Agreements"
        description="Send documents for signature and track who has signed."
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setTplOpen(true)}>Templates</Button>
            <Button size="sm" onClick={() => setNewOpen(true)}><Plus className="h-4 w-4" /> New agreement</Button>
          </div>
        }
      />

      <Tabs
        tabs={[{ value: 'agreements', label: 'Agreements', count: agreements.length }]}
        value={tab}
        onChange={setTab}
      />

      <Card>
        {loading ? (
          <div className="px-5 py-10 text-center text-muted-foreground">Loading…</div>
        ) : agreements.length === 0 ? (
          <EmptyState
            icon={<FileSignature className="h-6 w-6" />}
            title="No agreements yet"
            description="Raise an agreement from a template, add its signers, and send it for signature."
            action={<Button size="sm" onClick={() => setNewOpen(true)}><Plus className="h-4 w-4" /> New agreement</Button>}
          />
        ) : (
          <ul className="divide-y divide-border">
            {agreements.map((a) => (
              <li key={a.id}>
                <button onClick={() => setDetail(a)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-surface-2/50">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{a.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {a.signedCount} of {a.totalSigners} signed · raised by {a.createdByName} {relativeTime(a.createdAt)}
                    </span>
                  </span>
                  <Badge tone={STATUS_TONE[a.status] ?? 'neutral'}>{label(a.status)}</Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {detail && <DetailModal agreement={detail} onClose={() => setDetail(null)} onSend={() => send(detail)} />}
      {newOpen && (
        <NewAgreementModal
          templates={templates ?? []}
          onClose={() => setNewOpen(false)}
          onCreated={() => { setNewOpen(false); refetch(); toast.success('Agreement raised', 'Open it to send the signing links.'); }}
        />
      )}
      {tplOpen && (
        <TemplatesModal
          templates={templates ?? []}
          onClose={() => setTplOpen(false)}
          onChanged={refetchTemplates}
        />
      )}
    </div>
  );
}

function DetailModal({ agreement, onClose, onSend }: { agreement: Agreement; onClose: () => void; onSend: () => void }) {
  const toast = useToast();
  const done = agreement.status === 'completed';
  return (
    <Modal open onClose={onClose} size="lg" title={agreement.title}
      description={`${agreement.signedCount} of ${agreement.totalSigners} signed`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="outline" onClick={async () => {
            try { await downloadFile(`/agreements/${agreement.id}/document`, `${agreement.title}.pdf`); }
            catch (e) { toast.error('Download failed', (e as Error).message); }
          }}><Download className="h-4 w-4" /> Download PDF</Button>
          {!done && <Button onClick={onSend}><Send className="h-4 w-4" /> {agreement.sentAt ? 'Resend links' : 'Send for signature'}</Button>}
        </>
      }
    >
      <div className="space-y-4">
        <article className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-surface-2/30 p-4 text-sm text-foreground">
          {agreement.body}
        </article>
        <div className="rounded-lg border border-border p-3.5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Signers</p>
          <ul className="space-y-1.5">
            {agreement.signers.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{s.name}{s.phone ? <span className="text-muted-foreground"> · {s.phone}</span> : null}</span>
                <Badge tone={s.status === 'signed' ? 'success' : s.status === 'declined' ? 'danger' : 'neutral'}>{s.status}</Badge>
              </li>
            ))}
          </ul>
        </div>
        {/* Re-sending rotates every unsigned link, so a forwarded one stops working. */}
        {agreement.sentAt && !done && (
          <p className="text-xs text-muted-foreground">
            Re-sending issues fresh links and invalidates the previous ones for anyone who has not signed.
          </p>
        )}
      </div>
    </Modal>
  );
}

function NewAgreementModal({
  templates, onClose, onCreated,
}: { templates: AgreementTemplate[]; onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [body, setBody] = useState('');
  const [picked, setPicked] = useState<MemoPerson[]>([]);
  const [outsiders, setOutsiders] = useState<{ name: string; phone: string }[]>([]);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 250);
  const [saving, setSaving] = useState(false);

  const { data: dir } = useQuery(
    () => memosService.directory(debounced.trim() ? { search: debounced.trim() } : {}),
    [debounced],
  );
  const people = dir && dir.mode === 'people' ? dir.people : [];

  const canSave = useMemo(
    () => title.trim() && (templateId || body.trim()) && (picked.length + outsiders.filter((o) => o.name.trim()).length) > 0,
    [title, templateId, body, picked, outsiders],
  );

  const save = async () => {
    setSaving(true);
    try {
      await agreementsService.create({
        title: title.trim(),
        templateId: templateId || undefined,
        body: templateId ? undefined : body.trim(),
        signers: [
          ...picked.map((p) => ({ employeeId: p.id })),
          ...outsiders.filter((o) => o.name.trim()).map((o) => ({ name: o.name.trim(), phone: o.phone.trim() || undefined })),
        ],
      });
      onCreated();
    } catch (e) {
      toast.error('Could not create', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} size="lg" title="New agreement"
      description="Pick a template or write the text, then choose who must sign."
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={!canSave} loading={saving}>Create</Button></>}
    >
      <div className="space-y-4">
        <div>
          <Label required>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Employment Agreement 2026" />
        </div>

        <div>
          <Label>Template</Label>
          <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            <option value="">Write the text myself</option>
            {templates.filter((t) => t.isActive).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </div>

        {!templateId && (
          <div>
            <Label required>Agreement text</Label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6}
              placeholder="The undersigned agrees to…"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-ring" />
          </div>
        )}

        <div>
          <Label required>Signers</Label>
          {picked.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {picked.map((p) => (
                <span key={p.id} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                  {p.name}
                  <button onClick={() => setPicked((v) => v.filter((x) => x.id !== p.id))}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}
          <div className="rounded-lg border border-border">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees by name…"
                className="w-full bg-transparent text-sm text-foreground outline-none" />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {!debounced.trim() ? (
                <p className="px-3 py-4 text-center text-xs text-muted-foreground">Type a name to find employees.</p>
              ) : people.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-muted-foreground">Nobody found.</p>
              ) : people.map((p) => (
                <button key={p.id} onClick={() => setPicked((v) => v.some((x) => x.id === p.id) ? v : [...v, p])}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-2/60">
                  <span className="text-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.department}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {/* A counterparty outside the company has no employee record, but the
              agreement still needs their name and a number to reach them on. */}
          <Label>Someone outside the company</Label>
          {outsiders.map((o, i) => (
            <div key={i} className="mb-2 grid grid-cols-2 gap-2">
              <Input value={o.name} placeholder="Full name"
                onChange={(e) => setOutsiders((v) => v.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
              <Input value={o.phone} placeholder="WhatsApp number"
                onChange={(e) => setOutsiders((v) => v.map((x, j) => j === i ? { ...x, phone: e.target.value } : x))} />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setOutsiders((v) => [...v, { name: '', phone: '' }])}>
            <Plus className="h-4 w-4" /> Add external signer
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function TemplatesModal({
  templates, onClose, onChanged,
}: { templates: AgreementTemplate[]; onClose: () => void; onChanged: () => void }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const add = async () => {
    setSaving(true);
    try {
      await agreementsService.createTemplate({ name: name.trim(), body: body.trim() });
      setName(''); setBody('');
      onChanged();
      toast.success('Template saved');
    } catch (e) {
      toast.error('Could not save', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} size="lg" title="Agreement templates"
      description="Reusable text. Placeholders are filled in when an agreement is raised."
      footer={<Button variant="outline" onClick={onClose}>Close</Button>}
    >
      <div className="space-y-4">
        {templates.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {templates.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-3.5 py-2.5 text-sm">
                <span className="text-foreground">{t.name}</span>
                <Button variant="ghost" size="sm" onClick={async () => {
                  try { await agreementsService.removeTemplate(t.id); onChanged(); toast.success('Template removed'); }
                  catch (e) { toast.error('Could not remove', (e as Error).message); }
                }}>Remove</Button>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-3 rounded-lg border border-border p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">New template</p>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6}
            placeholder="This agreement is made by {{company}} on {{date}}…"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-ring" />
          <div className="flex items-center justify-between">
            <button type="button" className="text-xs text-muted-foreground underline"
              onClick={() => { navigator.clipboard.writeText('{{company}} {{date}} {{title}}'); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
              {copied ? <><Check className="mr-1 inline h-3 w-3" />Copied</> : <><Copy className="mr-1 inline h-3 w-3" />Placeholders: {'{{company}} {{date}} {{title}}'}</>}
            </button>
            <Button size="sm" onClick={add} disabled={!name.trim() || !body.trim()} loading={saving}>Save template</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

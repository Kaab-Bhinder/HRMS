import { useEffect, useState } from 'react';
import { Paperclip, Download, Send, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Input';
import { useToast } from '../../store/toast';
import { useAuth } from '../../store/auth';
import { tasksService, filesService, type TaskComment } from '../../services';
import type { Task, FileAttachment } from '../../lib/types';
import { formatDate, relativeTime } from '../../lib/format';

/**
 * Task detail: the department head's review surface.
 *
 * An assignee reports back with a note plus documents, and marking the work
 * finished moves the task to `in_review` rather than `done` — the head confirms
 * completion here. This modal is therefore both sides of that exchange: the
 * submission thread and its attachments, and the accept / send-back actions.
 */
export function TaskDetailModal({
  task,
  onClose,
  onChanged,
}: {
  task: Task | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const toast = useToast();
  const { user } = useAuth();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  // Anyone who can update tasks acts as the reviewer here (head, HR, admin).
  const canReview = !!user?.permissions?.includes('tasks:update');

  const load = async (id: string) => {
    setLoading(true);
    try {
      const [c, f] = await Promise.all([
        tasksService.comments(id).catch(() => [] as TaskComment[]),
        filesService.listByOwner('task', id).catch(() => [] as FileAttachment[]),
      ]);
      setComments(c ?? []);
      setFiles(f ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!task) return;
    setNote('');
    load(task.id);
  }, [task?.id]);

  if (!task) return null;

  const setStatus = async (status: string, label: string) => {
    setBusy(status);
    try {
      await tasksService.updateStatus(task.id, status);
      toast.success(label, `“${task.title}” is now ${status.replace('_', ' ')}.`);
      onChanged();
      onClose();
    } catch (e) {
      toast.error('Could not update', (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setBusy('note');
    try {
      await tasksService.addComment(task.id, note.trim());
      setNote('');
      await load(task.id);
    } catch (e) {
      toast.error('Could not post', (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const awaitingReview = task.status === 'in_review';

  return (
    <Modal
      open={!!task}
      onClose={onClose}
      size="lg"
      title={task.title}
      description={`${task.status.replace('_', ' ')} · due ${task.dueDate ? formatDate(task.dueDate) : 'no date'}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {canReview && awaitingReview && (
            <>
              <Button
                variant="outline"
                onClick={() => setStatus('in_progress', 'Sent back')}
                loading={busy === 'in_progress'}
              >
                <RotateCcw className="h-4 w-4" /> Send back
              </Button>
              <Button onClick={() => setStatus('done', 'Task completed')} loading={busy === 'done'}>
                <CheckCircle2 className="h-4 w-4" /> Accept &amp; complete
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="space-y-5">
        {awaitingReview && (
          <div className="rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-2.5 text-sm">
            <span className="font-medium text-foreground">Submitted for review.</span>{' '}
            <span className="text-muted-foreground">
              The assignee reported this finished — accept it to close the task, or send it back with a note.
            </span>
          </div>
        )}

        {task.description && (
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Brief</p>
            <p className="whitespace-pre-wrap text-sm text-foreground">{task.description}</p>
          </div>
        )}

        {/* Attachments — the documents submitted with the report. */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Documents {files.length > 0 && `(${files.length})`}
          </p>
          {loading ? (
            <p className="text-sm text-muted-foreground"><Loader2 className="inline h-3.5 w-3.5 animate-spin" /> Loading…</p>
          ) : files.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents attached.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {files.map((f) => (
                <li key={f.id} className="flex items-center gap-3 px-3.5 py-2.5">
                  <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{f.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.max(1, Math.round(Number(f.sizeBytes ?? 0) / 1024))} KB · {relativeTime(f.createdAt)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => filesService.download(f)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* The submission thread. */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Updates {comments.length > 0 && `(${comments.length})`}
          </p>
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing reported yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {comments.map((c) => (
                <li key={c.id} className="rounded-lg border border-border bg-surface-2/40 px-3.5 py-2.5">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{c.authorName ?? 'Team member'}</span>
                    <Badge tone="neutral">{relativeTime(c.createdAt)}</Badge>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{c.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Add a note for the assignee…"
          />
          <div className="mt-2 flex justify-end">
            <Button size="sm" variant="outline" onClick={addNote} disabled={!note.trim()} loading={busy === 'note'}>
              <Send className="h-3.5 w-3.5" /> Post note
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

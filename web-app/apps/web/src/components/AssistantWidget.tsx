import { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, Loader2, Sparkles } from 'lucide-react';
import { assistantService, type AssistantAnswer } from '../services';
import { useQuery } from '../hooks/useQuery';

interface Turn {
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
  toolsUsed?: string[];
  failed?: boolean;
}

/** Questions worth trying first — teaches what the assistant can actually do. */
const SUGGESTIONS = [
  'How many people are active right now?',
  'Who was absent today?',
  'How does payroll work here?',
  'Attendance trend for the last 7 days',
];

/**
 * Floating in-app assistant.
 *
 * Hides itself entirely when no provider is configured, so a workspace without
 * an API key never sees a button that cannot answer. Everything it reports is
 * scoped to the signed-in user by the server, so this component deliberately
 * does no filtering of its own.
 */
export function AssistantWidget() {
  const { data: status } = useQuery(() => assistantService.status(), []);
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape closes the panel, matching the command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!status?.available) return null;

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    setInput('');
    const history = turns.filter((t) => !t.failed).map((t) => ({ role: t.role, content: t.content }));
    setTurns((t) => [...t, { role: 'user', content: question }]);
    setBusy(true);
    try {
      const res: AssistantAnswer = await assistantService.ask(question, history);
      setTurns((t) => [...t, { role: 'assistant', content: res.reply, provider: res.provider, toolsUsed: res.toolsUsed }]);
    } catch (e) {
      setTurns((t) => [...t, { role: 'assistant', content: (e as Error).message || 'The assistant is unavailable.', failed: true }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open assistant"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-40 flex h-[min(600px,calc(100vh-3rem))] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <header className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Assistant</p>
              <p className="truncate text-xs text-muted-foreground">Answers about your workspace</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {turns.length === 0 && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-lg bg-surface-2 p-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Ask about your people, attendance, leave, or how something in the app works.
                    I only see what your role allows.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((q) => (
                    <button key={q} type="button" onClick={() => void send(q)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {turns.map((t, i) => (
              <div key={i} className={t.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={[
                    'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm',
                    t.role === 'user'
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : t.failed
                        ? 'rounded-bl-sm bg-danger/10 text-danger'
                        : 'rounded-bl-sm bg-surface-2 text-foreground',
                  ].join(' ')}
                >
                  {t.content}
                  {t.role === 'assistant' && !t.failed && (t.toolsUsed?.length || t.provider) && (
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {t.toolsUsed?.length ? `Checked: ${[...new Set(t.toolsUsed)].join(', ')}` : 'Answered directly'}
                      {t.provider ? ` · ${t.provider}` : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-surface-2 px-3.5 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>

          <form
            className="flex items-center gap-2 border-t border-border p-3"
            onSubmit={(e) => { e.preventDefault(); void send(input); }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              disabled={busy}
              className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

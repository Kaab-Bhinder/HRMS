import { useEffect, useRef } from 'react';
import { notificationsService } from '../services';
import { useToast } from '../store/toast';

/** How often to ask the server for anything new. */
const POLL_MS = 20_000;

/**
 * Turns stored notifications into live pop-ups.
 *
 * The bell already showed a count, but it was fetched once on mount and never
 * again — so an approval that landed while the page was open was invisible
 * until a manual refresh. This polls and raises a toast for anything that
 * arrives while the person is actually looking at the app.
 *
 * Polling rather than a socket on purpose: the API runs on an instance that
 * sleeps when idle, and a dropped socket that silently stops reconnecting is a
 * worse failure than a request every twenty seconds.
 */
export function NotificationWatcher({ onChange }: { onChange?: () => void }) {
  const toast = useToast();
  // Ids already announced. Seeded on the first pass so opening the app does not
  // replay every unread notification as a stack of pop-ups.
  const announced = useRef<Set<string> | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const rows = await notificationsService.list();
        if (!live) return;

        if (announced.current === null) {
          announced.current = new Set(rows.map((n) => n.id));
        } else {
          const fresh = rows.filter((n) => !n.read && !announced.current!.has(n.id));
          for (const n of fresh) {
            announced.current.add(n.id);
            // The context exposes success/error helpers only; anything else
            // goes through the generic form.
            toast.toast({ kind: 'info', title: n.title, description: n.body });
          }
          if (fresh.length) onChangeRef.current?.();
        }
      } catch {
        // A failed poll is not worth telling anyone about; the next one retries.
      } finally {
        // Chained rather than setInterval, so a slow response cannot stack up
        // overlapping requests.
        if (live) timer = setTimeout(tick, POLL_MS);
      }
    };

    // Checking on return to the tab is what makes this feel immediate, since
    // most of the waiting happens while the app is in a background tab.
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timer);
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    tick();
    return () => {
      live = false;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [toast]);

  return null;
}

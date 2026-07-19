import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { NAV } from '../config/nav';
import { cn } from '../lib/utils';
import { useAuth } from '../store/auth';
import { useI18n } from '../store/i18n';
import { useQuery } from '../hooks/useQuery';
import { notificationsService } from '../services';

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 22V10l7 5 7-5v12" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-sidebar-foreground">Workforce</p>
        <p className="text-[11px] text-sidebar-muted">Admin Console</p>
      </div>
    </div>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { can } = useAuth();
  const { t } = useI18n();
  const { data: notifs } = useQuery(() => notificationsService.list(), []);
  const unread = notifs?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Brand />
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV.map((section) => {
          const items = section.items.filter((i) => !i.permission || can(i.permission));
          if (!items.length) return null;
          return (
            <div key={section.title}>
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">{t(section.title)}</p>
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus-ring',
                        isActive ? 'bg-accent text-white shadow-sm' : 'text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-white' : 'text-sidebar-muted group-hover:text-sidebar-foreground')} />
                        <span className="flex-1 truncate">{t(item.label)}</span>
                        {item.badge === 'notifications' && unread > 0 && (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-semibold text-white">{unread}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-lg bg-sidebar-foreground/10 p-3">
          <p className="text-xs font-medium text-sidebar-foreground">Acme Bank · Workforce</p>
          <p className="mt-0.5 text-[11px] text-sidebar-muted">v1.0 · Live</p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
      <div className="sticky top-0 h-screen">
        <SidebarContent />
      </div>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-72 bg-sidebar shadow-pop animate-slide-up">
        <button onClick={onClose} className="absolute right-3 top-4 z-10 rounded-md p-1.5 text-sidebar-muted hover:bg-sidebar-foreground/10 focus-ring">
          <X className="h-5 w-5" />
        </button>
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  );
}

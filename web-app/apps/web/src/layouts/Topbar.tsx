import { useNavigate } from 'react-router-dom';
import { Bell, Check, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react';
import { HeaderClock } from '../components/HeaderClock';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from '../components/ui/Dropdown';
import { Kbd } from '../components/ui/Misc';
import { StatusBadge } from '../components/StatusBadge';
import { useTheme } from '../store/theme';
import { useI18n } from '../store/i18n';
import { useAuth } from '../store/auth';
import { useQuery } from '../hooks/useQuery';
import { notificationsService } from '../services';
import { relativeTime } from '../lib/format';
import { cn } from '../lib/utils';

export function Topbar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const { theme, toggle } = useTheme();
  const { lang, toggle: toggleLang, t } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: notifs, refetch } = useQuery(() => notificationsService.list(), []);
  const unread = notifs?.filter((n) => !n.read).length ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md">
      <button onClick={onMenu} className="rounded-md p-2 text-muted-foreground hover:bg-surface-2 focus-ring lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={onSearch}
        className="group flex h-9 flex-1 items-center gap-2.5 rounded-md border border-border bg-surface-2/60 px-3 text-sm text-muted-foreground transition-colors hover:border-ring/40 sm:max-w-xs"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">{t('Search…')}</span>
        <span className="hidden items-center gap-0.5 sm:flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <HeaderClock />
        <button
          onClick={toggleLang}
          aria-label="Switch language"
          title={lang === 'en' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English'}
          className="flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-ring"
        >
          {lang === 'en' ? 'EN' : 'ID'}
        </button>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label={t('Toggle theme')}>
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </Button>

        <Dropdown
          width="w-80"
          trigger={
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />}
            </Button>
          }
        >
          <div className="flex items-center justify-between px-2.5 py-2">
            <p className="text-sm font-semibold text-foreground">{t('Notifications')}</p>
            {unread > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); notificationsService.markAllRead().then(refetch); }}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Check className="h-3 w-3" /> {t('Mark all read')}
              </button>
            )}
          </div>
          <DropdownSeparator />
          <div className="max-h-72 overflow-y-auto">
            {(notifs ?? []).slice(0, 6).map((n) => (
              <div key={n.id} className={cn('flex gap-2.5 rounded-md px-2.5 py-2', !n.read && 'bg-primary/5')}>
                <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-primary')} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70">{relativeTime(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
          <DropdownSeparator />
          <DropdownItem onClick={() => navigate('/notifications')}>{t('View all notifications')}</DropdownItem>
        </Dropdown>

        <Dropdown
          width="w-56"
          trigger={
            <button className="ml-1 flex items-center gap-2 rounded-full p-0.5 focus-ring">
              <Avatar name={user?.fullName ?? 'U'} size="sm" />
            </button>
          }
        >
          <DropdownLabel>
            <div className="flex items-center gap-2.5 py-1">
              <Avatar name={user?.fullName ?? 'U'} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user?.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </DropdownLabel>
          <div className="px-2.5 pb-1.5">{user && <StatusBadge value="active" dot />} <span className="ml-1 text-xs text-muted-foreground">{user?.roleName}</span></div>
          <DropdownSeparator />
          <DropdownItem icon={<User />} onClick={() => navigate('/profile')}>{t('My Profile')}</DropdownItem>
          <DropdownItem icon={<Settings />} onClick={() => navigate('/settings')}>{t('Settings')}</DropdownItem>
          <DropdownSeparator />
          <DropdownItem icon={<LogOut />} danger onClick={() => { logout(); navigate('/login'); }}>{t('Sign out')}</DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}

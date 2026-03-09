import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, MessageSquare, Briefcase, FileText, DollarSign, Settings, LayoutGrid, Bell, Menu, Video } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAdvisorStore } from '../../store/useAdvisorStore';
import { cn } from '../../lib/utils';

const NAV = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: LayoutGrid, label: 'CRM Pipeline', path: '/crm' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: Video, label: 'Recordings', path: '/recordings' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: Briefcase, label: 'Engagements', path: '/engagements' },
  { icon: FileText, label: 'Documents', path: '/documents' },
  { icon: DollarSign, label: 'Earnings', path: '/earnings' },
];

export function AdvisorLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { name, advisorProfile } = useAdvisorStore();
  const avatarInitials = name ? name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'AD';
  const sebiNumber = advisorProfile?.sebi_registration_number || '';

  return (
    <div className="flex min-h-screen bg-dark-base">
      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-[240px] flex-col bg-sidebar border-r border-dark-border p-5 transition-transform md:relative md:translate-x-0 md:flex',
        mobileOpen ? 'flex translate-x-0' : 'hidden -translate-x-full'
      )}>
        <div className="flex items-center gap-2 mb-1">
          <Logo dark />
        </div>
        <span className="inline-flex w-fit rounded-full bg-dark-surface px-2 py-0.5 font-body text-[10px] font-medium uppercase tracking-wider text-dark-muted mb-6">Advisor Portal</span>

        <nav className="flex-1 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);
            return (
              <button key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false); }} className={cn('flex w-full items-center gap-3 rounded-[8px] px-3 py-2 font-body text-[13px] transition-colors', active ? 'bg-dark-surface text-white border-l-[3px] border-l-teal' : 'text-dark-muted hover:text-white hover:bg-dark-surface/50')}>
                <Icon className="h-4 w-4" />{item.label}
              </button>
            );
          })}
        </nav>

        <button onClick={() => navigate('/settings')} className="flex items-center gap-3 px-3 py-2 font-body text-[13px] text-dark-muted hover:text-white mb-4">
          <Settings className="h-4 w-4" /> Settings
        </button>

        <div className="flex items-center gap-3 border-t border-dark-border pt-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal font-body text-sm font-semibold text-dark-base">{avatarInitials}</div>
          <div>
            <p className="font-body text-sm text-white truncate max-w-[140px]">{name}</p>
            <p className="font-mono text-[10px] text-dark-muted">{sebiNumber}</p>
          </div>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />}

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-dark-border bg-dark-base/80 backdrop-blur-sm px-6 py-3">
          <button className="md:hidden text-white" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-dark-surface px-2.5 py-1 font-body text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" /> Synced
            </span>
            <button className="relative text-dark-muted hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal font-body text-[9px] font-bold text-dark-base">3</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

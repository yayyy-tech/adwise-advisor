import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, ClipboardList } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AdvisorLayout } from '../components/layout/AdvisorLayout';
import { Button } from '../components/ui/Button';
import { useAdvisorStore } from '../store/useAdvisorStore';
import { supabase } from '../lib/supabase';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { advisor } = useAdvisorStore();

  const { data: stats } = useQuery({
    queryKey: ['advisor-dashboard-stats', advisor?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const [leads, engagements, bookingsToday, notifications] = await Promise.all([
        supabase.from('crm_leads').select('id, stage', { count: 'exact' }).eq('advisor_id', advisor!.id),
        supabase.from('engagements').select('id', { count: 'exact' }).eq('advisor_id', advisor!.id).eq('status', 'active'),
        supabase.from('bookings').select('*, user:profiles!user_id(full_name)')
          .eq('advisor_id', advisor!.id).eq('status', 'scheduled')
          .gte('scheduled_at', `${today}T00:00:00`).lte('scheduled_at', `${today}T23:59:59`),
        supabase.from('notifications').select('id, title, body, created_at')
          .eq('recipient_id', advisor!.id).eq('is_read', false).order('created_at', { ascending: false }).limit(5),
      ]);

      const stageCount = (stage: string) => leads.data?.filter((l: any) => l.stage === stage).length ?? 0;

      return {
        newLeads: leads.data?.filter((l: any) => l.stage === 'discovery_scheduled').length ?? 0,
        activeClients: engagements.count ?? 0,
        todaySessions: bookingsToday.data ?? [],
        pipeline: [
          { label: 'Discovery', count: stageCount('discovery_scheduled') + stageCount('discovery_completed') },
          { label: 'Proposal', count: stageCount('proposal_sent') },
          { label: 'Negotiating', count: stageCount('negotiating') },
          { label: 'Engaged', count: stageCount('engaged') },
        ],
        notifications: notifications.data ?? [],
      };
    },
    enabled: !!advisor?.id,
  });

  const [_actionDone, _setActionDone] = useState<Record<string, boolean>>({});

  return (
    <AdvisorLayout>
      <div className="max-w-[1060px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Sessions */}
            {stats?.todaySessions && stats.todaySessions.length > 0 && (
              <div>
                <span className="font-body text-[11px] font-medium uppercase tracking-wider text-dark-muted mb-3 block">Today&apos;s Sessions</span>
                <div className="space-y-2">
                  {stats.todaySessions.map((s: any) => {
                    const name = s.user?.full_name || 'Client';
                    const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <div key={s.id} className="flex items-center gap-4 rounded-[12px] bg-dark-surface px-5 py-4">
                        <span className="font-mono text-sm text-dark-muted w-16">
                          {new Date(s.scheduled_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/20 font-body text-xs font-semibold text-teal">{initials}</div>
                        <div className="flex-1">
                          <p className="font-body text-sm text-white">{name} &middot; {s.booking_type === 'discovery' ? 'Discovery Call' : 'Session'}</p>
                        </div>
                        <div className="flex gap-1.5">
                          {s.daily_room_url && (
                            <Button variant="teal" size="xs" onClick={() => window.open(s.daily_room_url, '_blank')}><Video className="h-3 w-3 mr-1" /> Join</Button>
                          )}
                          <Button variant="dark-outline" size="xs"><ClipboardList className="h-3 w-3 mr-1" /> Notes</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'NEW LEADS', value: String(stats?.newLeads ?? 0), color: 'text-teal' },
                { label: 'ACTIVE CLIENTS', value: String(stats?.activeClients ?? 0), color: 'text-dark-muted' },
                { label: 'TODAY SESSIONS', value: String(stats?.todaySessions?.length ?? 0), color: 'text-dark-muted' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="rounded-[16px] bg-dark-surface p-5">
                  <p className="font-body text-[11px] font-medium uppercase tracking-wider text-dark-muted">{s.label}</p>
                  <p className="mt-1 font-mono text-2xl text-white">{s.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Pipeline Snapshot */}
            <div className="rounded-[16px] bg-dark-surface p-5">
              <span className="font-body text-[11px] font-medium uppercase tracking-wider text-dark-muted block mb-3">Pipeline</span>
              <div className="flex items-center gap-3">
                {(stats?.pipeline ?? []).map((p: any, i: number) => (
                  <div key={p.label} className="flex items-center gap-2">
                    <button onClick={() => navigate('/crm')} className="font-body text-sm text-dark-text hover:text-teal transition-colors">
                      {p.label}({p.count})
                    </button>
                    {i < (stats?.pipeline?.length ?? 0) - 1 && <span className="text-dark-muted-2">&rarr;</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Recent Notifications */}
          <div>
            <span className="font-body text-[11px] font-medium uppercase tracking-wider text-dark-muted block mb-3">Recent Activity</span>
            <div className="space-y-3">
              {(stats?.notifications ?? []).length === 0 ? (
                <p className="font-body text-sm text-dark-muted">{'\u2705'} All caught up.</p>
              ) : (
                stats!.notifications.map((n: any, i: number) => (
                  <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal flex-shrink-0" />
                    <div>
                      <p className="font-body text-sm text-dark-text">{n.title}</p>
                      <p className="font-body text-[11px] text-dark-muted">
                        {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdvisorLayout>
  );
}

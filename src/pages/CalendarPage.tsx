import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, ClipboardList, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AdvisorLayout } from '../components/layout/AdvisorLayout';
import { Button } from '../components/ui/Button';
import { useAdvisorStore } from '../store/useAdvisorStore';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

export default function CalendarPage() {
  const { advisor, advisorProfile } = useAdvisorStore();
  const [view, setView] = useState<'Week' | 'Day'>('Week');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1 + weekOffset * 7);
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const weekStart = days[0].toISOString().split('T')[0];
  const weekEnd = days[4].toISOString().split('T')[0];

  const { data: bookings } = useQuery({
    queryKey: ['calendar-bookings', advisor?.id, weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, user:profiles!user_id(full_name)')
        .eq('advisor_id', advisor!.id)
        .gte('scheduled_at', `${weekStart}T00:00:00`)
        .lte('scheduled_at', `${weekEnd}T23:59:59`)
        .not('status', 'eq', 'cancelled');
      if (error) throw error;
      return data;
    },
    enabled: !!advisor?.id,
  });

  const getSessionsForSlot = (day: Date, hour: number) => {
    return (bookings ?? []).filter((b: any) => {
      const d = new Date(b.scheduled_at);
      return d.toDateString() === day.toDateString() && d.getHours() === hour;
    });
  };

  return (
    <AdvisorLayout>
      <div className="max-w-[1060px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-[28px] text-dark-text">Calendar</h1>
          <div className="flex gap-2 items-center">
            <button onClick={() => setWeekOffset(w => w - 1)} className="text-dark-muted hover:text-white font-body text-sm">&larr;</button>
            <span className="font-body text-sm text-dark-muted">
              {days[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {days[4].toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <button onClick={() => setWeekOffset(w => w + 1)} className="text-dark-muted hover:text-white font-body text-sm">&rarr;</button>
          </div>
        </div>

        <div className="rounded-[16px] bg-dark-surface border border-dark-border overflow-hidden">
          <div className="grid" style={{ gridTemplateColumns: '60px repeat(5, 1fr)' }}>
            <div className="border-b border-r border-dark-border p-2" />
            {days.map((d) => (
              <div key={d.toDateString()} className="border-b border-r border-dark-border p-2 text-center font-body text-xs font-medium text-dark-muted">
                {d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}
              </div>
            ))}
          </div>
          <div className="grid" style={{ gridTemplateColumns: '60px repeat(5, 1fr)' }}>
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                <div className="border-b border-r border-dark-border px-2 py-3 font-mono text-[11px] text-dark-muted-2">{hour}:00</div>
                {days.map((day) => {
                  const sessions = getSessionsForSlot(day, hour);
                  return (
                    <div key={`${hour}-${day.toDateString()}`} className="border-b border-r border-dark-border p-1 min-h-[48px] relative">
                      {sessions.map((s: any) => {
                        const clientName = s.user?.full_name || 'Client';
                        return (
                          <button key={s.id} onClick={() => setSelectedSession(s)} className={cn(
                            'w-full rounded-[6px] px-2 py-1 text-left font-body text-[11px]',
                            s.booking_type === 'discovery' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-teal/10 text-teal border border-teal/20'
                          )}>
                            {clientName}<br />{s.booking_type === 'discovery' ? 'Discovery' : 'Session'}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {selectedSession && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 right-6 z-30 rounded-[16px] bg-dark-surface border border-dark-border p-5 shadow-xl w-80">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/20 font-body text-sm font-semibold text-teal">
                {(selectedSession.user?.full_name || 'C').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-body text-sm font-medium text-white">{selectedSession.user?.full_name}</p>
                <p className="font-body text-xs text-dark-muted">{selectedSession.booking_type === 'discovery' ? 'Discovery Call' : 'Session'}</p>
              </div>
            </div>
            <p className="font-body text-xs text-dark-muted mb-3">
              {new Date(selectedSession.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} &middot; {selectedSession.duration_minutes || 60} min
            </p>
            <div className="flex gap-2">
              {selectedSession.daily_room_url && (
                <Button variant="teal" size="xs" onClick={() => window.open(selectedSession.daily_room_url, '_blank')}><Video className="h-3 w-3 mr-1" /> Join</Button>
              )}
              <Button variant="dark-outline" size="xs"><ClipboardList className="h-3 w-3 mr-1" /> Notes</Button>
            </div>
            <button onClick={() => setSelectedSession(null)} className="absolute top-2 right-3 font-body text-xs text-dark-muted hover:text-white">&times;</button>
          </motion.div>
        )}

        <div className="mt-6 rounded-[16px] bg-dark-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-body text-sm font-semibold text-white">Weekly Availability</span>
          </div>
          <div className="font-body text-sm text-dark-muted space-y-1">
            <p>Slot: 60 min</p>
          </div>
          {advisorProfile?.google_calendar_connected && (
            <div className="mt-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" />
              <span className="font-body text-xs text-teal">Google Calendar synced</span>
            </div>
          )}
        </div>
      </div>
    </AdvisorLayout>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Calendar, MessageSquare, Upload } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AdvisorLayout } from '../components/layout/AdvisorLayout';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { useAdvisorStore } from '../store/useAdvisorStore';
import { supabase } from '../lib/supabase';
import { formatINR, cn } from '../lib/utils';

export default function EngagementsPage() {
  const navigate = useNavigate();
  const { advisor } = useAdvisorStore();
  const [tab, setTab] = useState('Active');

  const { data: engagements, isLoading } = useQuery({
    queryKey: ['advisor-engagements', advisor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engagements')
        .select('*, user:profiles!user_id(full_name, email)')
        .eq('advisor_id', advisor!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!advisor?.id,
  });

  const all = engagements ?? [];
  const active = all.filter((e: any) => e.status === 'active');
  const proposed = all.filter((e: any) => e.status === 'proposed');
  const completed = all.filter((e: any) => e.status === 'completed');
  const filtered = tab === 'Active' ? active : tab === 'Proposed' ? proposed : completed;

  const getInitials = (e: any) => {
    const name = e.user?.full_name || 'C';
    return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <AdvisorLayout>
      <div className="max-w-[960px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-[28px] text-dark-text">Engagements</h1>
        </div>

        <Tabs tabs={['Active', 'Proposed', 'Completed']} active={tab} onChange={setTab} />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filtered.length === 0 ? (
              <p className="font-body text-sm text-dark-muted text-center py-12">No {tab.toLowerCase()} engagements.</p>
            ) : filtered.map((c: any, i: number) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-[20px] bg-dark-surface p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/20 font-body text-base font-semibold text-teal">{getInitials(c)}</div>
                  <div className="flex-1">
                    <p className="font-body text-base font-medium text-white">{c.user?.full_name || 'Client'}</p>
                    <p className="font-mono text-xs text-dark-muted">{c.plan_snapshot?.name || 'Plan'} &middot; {c.plan_snapshot?.price_inr ? formatINR(c.plan_snapshot.price_inr) : '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <span className={cn('rounded-full px-2 py-0.5 font-body text-[11px]',
                    c.status === 'active' ? 'bg-teal/10 text-teal' :
                    c.status === 'proposed' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-blue-500/10 text-blue-400'
                  )}>{c.status}</span>
                </div>
                {c.status === 'active' && (
                  <>
                    <div className="flex items-center gap-1.5 mb-3">
                      {Array.from({ length: c.sessions_included || 0 }).map((_, j) => (
                        <div key={j} className={cn('h-2 w-2 rounded-full', j < (c.sessions_completed || 0) ? 'bg-teal' : 'border border-dark-border')} />
                      ))}
                      <span className="font-mono text-xs text-dark-muted ml-2">{c.sessions_completed || 0} of {c.sessions_included || 0}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="dark-outline" size="sm" onClick={() => navigate('/messages')}><MessageSquare className="h-3.5 w-3.5 mr-1" /> Message</Button>
                      <Button variant="dark-outline" size="sm" onClick={() => navigate(`/clients/${c.id}`)}>View Client &rarr;</Button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdvisorLayout>
  );
}

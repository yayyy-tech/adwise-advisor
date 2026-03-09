import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, Check } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdvisorLayout } from '../components/layout/AdvisorLayout';
import { useAdvisorStore } from '../store/useAdvisorStore';
import { supabase } from '../lib/supabase';
import { formatINR, cn } from '../lib/utils';

export default function ClientsPage() {
  const navigate = useNavigate();
  const { advisor } = useAdvisorStore();
  const [search, setSearch] = useState('');

  const { data: engagements, isLoading } = useQuery({
    queryKey: ['advisor-clients', advisor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engagements')
        .select('*, user:profiles!user_id(full_name, email, city)')
        .eq('advisor_id', advisor!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!advisor?.id,
  });

  const clients = (engagements ?? []).filter((c: any) =>
    (c.user?.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (c: any) => {
    const name = c.user?.full_name || 'C';
    return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <AdvisorLayout>
      <div className="max-w-[960px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-[28px] text-dark-text">Clients</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dark-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..." className="rounded-[8px] border border-dark-border bg-dark-surface pl-9 pr-4 py-2 font-body text-sm text-dark-text placeholder:text-dark-muted-2 focus:outline-none focus:border-teal w-64" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
          </div>
        ) : (
          <div className="rounded-[16px] bg-dark-surface border border-dark-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Client', 'Plan', 'Sessions', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-body text-[11px] font-medium uppercase tracking-wider text-dark-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c: any, i: number) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/clients/${c.id}`)}
                    className="border-b border-dark-border/50 cursor-pointer hover:bg-dark-surface-2 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/20 font-body text-xs font-semibold text-teal">{getInitials(c)}</div>
                        <div>
                          <p className="font-body text-sm font-medium text-white">{c.user?.full_name || '—'}</p>
                          <p className="font-body text-[11px] text-dark-muted">{c.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-body text-sm text-dark-text">{c.plan_snapshot?.name || '—'}</p>
                      {c.plan_snapshot?.price_inr && <p className="font-mono text-[11px] text-dark-muted">{formatINR(c.plan_snapshot.price_inr)}/yr</p>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        {Array.from({ length: c.sessions_included || 0 }).map((_, j) => (
                          <div key={j} className={cn('h-2 w-2 rounded-full', j < (c.sessions_completed || 0) ? 'bg-teal' : 'border border-dark-border')} />
                        ))}
                      </div>
                      <p className="font-mono text-[11px] text-dark-muted mt-0.5">{c.sessions_completed || 0}/{c.sessions_included || 0}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 font-body text-[11px] font-medium',
                        c.status === 'active' ? 'bg-teal/10 text-teal' :
                        c.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-amber-500/10 text-amber-500'
                      )}>
                        {c.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdvisorLayout>
  );
}

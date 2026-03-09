import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { AdvisorLayout } from '../components/layout/AdvisorLayout';
import { useAdvisorStore } from '../store/useAdvisorStore';
import { supabase } from '../lib/supabase';
import { formatINR, cn } from '../lib/utils';

export default function EarningsPage() {
  const { advisor } = useAdvisorStore();

  const { data: engagements } = useQuery({
    queryKey: ['advisor-earnings', advisor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engagements')
        .select('*, user:profiles!user_id(full_name)')
        .eq('advisor_id', advisor!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!advisor?.id,
  });

  const all = engagements ?? [];
  const active = all.filter((e: any) => e.status === 'active');
  const totalRevenue = all.reduce((sum: number, e: any) => sum + (e.plan_snapshot?.price_inr || 0), 0);

  const stats = [
    { label: 'ALL TIME REVENUE', value: formatINR(totalRevenue) },
    { label: 'ACTIVE CLIENTS', value: String(active.length) },
    { label: 'TOTAL ENGAGEMENTS', value: String(all.length) },
  ];

  return (
    <AdvisorLayout>
      <div className="max-w-[960px]">
        <h1 className="font-display text-[28px] text-dark-text mb-6">Earnings</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-[16px] bg-dark-surface p-5">
              <p className="font-body text-[11px] uppercase tracking-wider text-dark-muted">{s.label}</p>
              <p className="mt-1 font-mono text-2xl text-white">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-[16px] bg-dark-surface border border-dark-border overflow-hidden mb-6">
          <table className="w-full">
            <thead><tr className="border-b border-dark-border">
              {['Client', 'Plan', 'Amount', 'Sessions', 'Status'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left font-body text-[11px] uppercase tracking-wider text-dark-muted">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {all.map((c: any) => (
                <tr key={c.id} className="border-b border-dark-border/50">
                  <td className="px-4 py-3 font-body text-sm text-dark-text">{c.user?.full_name || '—'}</td>
                  <td className="px-4 py-3 font-body text-sm text-dark-text">{c.plan_snapshot?.name || '—'}</td>
                  <td className="px-4 py-3 font-mono text-sm text-dark-text">{c.plan_snapshot?.price_inr ? formatINR(c.plan_snapshot.price_inr) : '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-dark-muted">{c.sessions_completed || 0}/{c.sessions_included || 0}</td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 font-body text-[11px]',
                      c.status === 'active' ? 'bg-teal/10 text-teal' :
                      c.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-amber-500/10 text-amber-500'
                    )}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdvisorLayout>
  );
}

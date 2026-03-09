import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Phone, Calendar, FileText, Download, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AdvisorLayout } from '../components/layout/AdvisorLayout';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { useAdvisorStore } from '../store/useAdvisorStore';
import { supabase } from '../lib/supabase';
import { formatINR, cn } from '../lib/utils';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { advisor } = useAdvisorStore();
  const [tab, setTab] = useState('Profile');

  const { data: engagement, isLoading } = useQuery({
    queryKey: ['client-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engagements')
        .select('*, user:profiles!user_id(full_name, email, city, phone)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: bookings } = useQuery({
    queryKey: ['client-sessions', id],
    queryFn: async () => {
      if (!engagement) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('advisor_id', advisor!.id)
        .eq('user_id', engagement.user_id)
        .order('scheduled_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!engagement && !!advisor?.id,
  });

  const { data: documents } = useQuery({
    queryKey: ['client-documents', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('engagement_id', id!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <AdvisorLayout><div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" /></div></AdvisorLayout>;
  }

  if (!engagement) return <AdvisorLayout><p className="text-dark-muted">Client not found.</p></AdvisorLayout>;

  const name = engagement.user?.full_name || 'Client';
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <AdvisorLayout>
      <div className="max-w-[960px]">
        <button onClick={() => navigate('/clients')} className="flex items-center gap-2 font-body text-sm text-dark-muted hover:text-white mb-6"><ArrowLeft className="h-4 w-4" /> Back to Clients</button>

        <div className="rounded-[20px] bg-dark-surface p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal/20 font-body text-xl font-semibold text-teal">{initials}</div>
            <div className="flex-1">
              <h1 className="font-body text-2xl font-semibold text-white">{name}</h1>
              <p className="font-body text-sm text-dark-muted">{engagement.plan_snapshot?.name || 'Plan'} &middot; Session {engagement.sessions_completed || 0} of {engagement.sessions_included || 0}</p>
              <div className="mt-3 flex items-center gap-4 flex-wrap">
                <div className="flex gap-1">
                  {Array.from({ length: engagement.sessions_included || 0 }).map((_, j) => (
                    <div key={j} className={cn('h-2.5 w-2.5 rounded-full', j < (engagement.sessions_completed || 0) ? 'bg-teal' : 'border border-dark-border')} />
                  ))}
                </div>
                <span className={cn('rounded-full px-2 py-0.5 font-body text-[11px]', engagement.status === 'active' ? 'bg-teal/10 text-teal' : 'bg-dark-surface-2 text-dark-muted')}>{engagement.status}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="dark-outline" size="sm" onClick={() => navigate('/messages')}><MessageSquare className="h-3.5 w-3.5 mr-1" /> Message</Button>
            </div>
          </div>
        </div>

        <Tabs tabs={['Profile', 'Sessions', 'Documents']} active={tab} onChange={setTab} />

        <div className="mt-6">
          {tab === 'Profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-[16px] bg-dark-surface p-5 space-y-3">
                <h3 className="font-body text-sm font-semibold text-white">Client Info</h3>
                {[
                  ['Name', name],
                  ['Email', engagement.user?.email || '—'],
                  ['City', engagement.user?.city || '—'],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between font-body text-sm"><span className="text-dark-muted">{l}</span><span className="text-dark-text font-mono">{v}</span></div>
                ))}
              </div>
              <div className="rounded-[16px] bg-dark-surface p-5 space-y-3">
                <h3 className="font-body text-sm font-semibold text-white">Plan Details</h3>
                {[
                  ['Plan', engagement.plan_snapshot?.name || '—'],
                  ['Price', engagement.plan_snapshot?.price_inr ? formatINR(engagement.plan_snapshot.price_inr) + '/year' : '—'],
                  ['Sessions', `${engagement.sessions_completed || 0}/${engagement.sessions_included || 0}`],
                  ['Status', engagement.status],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between font-body text-sm"><span className="text-dark-muted">{l}</span><span className="text-dark-text">{v}</span></div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Sessions' && (
            <div className="space-y-3">
              {(bookings ?? []).map((s: any) => (
                <div key={s.id} className="rounded-[12px] bg-dark-surface p-4 flex items-center gap-4">
                  <span className="font-mono text-xs text-dark-muted w-24">
                    {new Date(s.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <div className="flex-1">
                    <p className="font-body text-sm text-white">
                      {s.booking_type === 'discovery' ? 'Discovery Call' : 'Session'} &middot;{' '}
                      {new Date(s.scheduled_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={cn('rounded-full px-2 py-0.5 font-body text-[11px]',
                    s.status === 'completed' ? 'bg-dark-surface-2 text-dark-muted' : 'bg-teal/10 text-teal'
                  )}>{s.status}</span>
                </div>
              ))}
              {(bookings ?? []).length === 0 && <p className="font-body text-sm text-dark-muted text-center py-8">No sessions yet.</p>}
            </div>
          )}

          {tab === 'Documents' && (
            <div className="space-y-3">
              {(documents ?? []).map((doc: any) => (
                <div key={doc.id} className="flex items-center gap-4 rounded-[12px] bg-dark-surface px-5 py-4">
                  <FileText className={cn('h-5 w-5', doc.status === 'signed' ? 'text-teal' : doc.status === 'overdue' ? 'text-red-400' : 'text-amber-500')} />
                  <div className="flex-1">
                    <p className="font-body text-sm text-white">{doc.name}</p>
                    {doc.sent_at && <p className="font-body text-[11px] text-dark-muted">Sent: {new Date(doc.sent_at).toLocaleDateString('en-IN')}</p>}
                  </div>
                  <span className={cn('font-body text-xs font-medium',
                    doc.status === 'signed' ? 'text-teal' : doc.status === 'overdue' ? 'text-red-400' : 'text-amber-500'
                  )}>
                    {doc.status === 'signed' ? '\u2713 SIGNED' : doc.status === 'overdue' ? 'OVERDUE' : doc.status === 'sent_pending' ? 'PENDING' : doc.status?.toUpperCase()}
                  </span>
                </div>
              ))}
              {(documents ?? []).length === 0 && <p className="font-body text-sm text-dark-muted text-center py-8">No documents yet.</p>}
            </div>
          )}
        </div>
      </div>
    </AdvisorLayout>
  );
}

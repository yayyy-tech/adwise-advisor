import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Check, Clock, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AdvisorLayout } from '../components/layout/AdvisorLayout';
import { Button } from '../components/ui/Button';
import { useAdvisorStore } from '../store/useAdvisorStore';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const FILTERS = ['All', 'Pending', 'Overdue', 'Completed'];

export default function DocumentsPage() {
  const { advisor } = useAdvisorStore();
  const [filter, setFilter] = useState('All');

  const { data: documents, isLoading } = useQuery({
    queryKey: ['advisor-documents', advisor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*, engagement:engagements!engagement_id(user_id, user:profiles!user_id(full_name))')
        .eq('advisor_id', advisor!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!advisor?.id,
  });

  const { data: templates } = useQuery({
    queryKey: ['advisor-templates', advisor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .or(`advisor_id.eq.${advisor!.id},is_standard.eq.true`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!advisor?.id,
  });

  const allDocs = documents ?? [];
  const filteredDocs = allDocs.filter((d: any) => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return d.status === 'sent_pending' || d.status === 'not_sent';
    if (filter === 'Overdue') return d.status === 'overdue';
    if (filter === 'Completed') return d.status === 'signed';
    return true;
  });

  const pending = allDocs.filter((d: any) => d.status === 'sent_pending' || d.status === 'not_sent' || d.status === 'overdue');

  return (
    <AdvisorLayout>
      <div className="max-w-[1060px]">
        <h1 className="font-display text-[28px] text-dark-text mb-6">Documents</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-body text-sm font-semibold text-white">Document Templates</h2>
              <Button variant="dark-outline" size="xs"><Upload className="h-3 w-3 mr-1" /> Upload</Button>
            </div>
            {(templates ?? []).length === 0 ? (
              <p className="font-body text-sm text-dark-muted py-4">No templates yet.</p>
            ) : (
              (templates ?? []).map((t: any) => (
                <div key={t.id} className="rounded-[16px] bg-dark-surface p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-body text-sm font-medium text-white">{t.name}</p>
                      {t.description && <p className="font-body text-xs text-dark-muted mt-1">{t.description}</p>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-body text-sm font-semibold text-white">Client Document Status</h2>

            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={cn('rounded-full px-3 py-1 font-body text-xs transition-colors', filter === f ? 'bg-teal text-dark-base' : 'bg-dark-surface border border-dark-border text-dark-muted')}>
                  {f}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal border-t-transparent" />
              </div>
            ) : (
              <div className="rounded-[16px] bg-dark-surface border border-dark-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-border">
                      {['Client', 'Document', 'Status', 'Sent'].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left font-body text-[11px] uppercase tracking-wider text-dark-muted">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc: any, i: number) => (
                      <motion.tr key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-dark-border/50">
                        <td className="px-4 py-3 font-body text-sm text-dark-text">{doc.engagement?.user?.full_name || '—'}</td>
                        <td className="px-4 py-3 font-body text-sm text-dark-text">{doc.name}</td>
                        <td className="px-4 py-3">
                          <span className={cn('flex items-center gap-1 font-body text-xs',
                            doc.status === 'signed' ? 'text-teal' : doc.status === 'overdue' ? 'text-red-400' : 'text-amber-500'
                          )}>
                            {doc.status === 'signed' ? <Check className="h-3 w-3" /> : doc.status === 'overdue' ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-dark-muted">
                          {doc.sent_at ? new Date(doc.sent_at).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="rounded-[16px] bg-dark-surface p-4 flex gap-6">
              <div><p className="font-body text-[11px] uppercase tracking-wider text-dark-muted">Total</p><p className="font-mono text-lg text-white">{allDocs.length}</p></div>
              <div><p className="font-body text-[11px] uppercase tracking-wider text-dark-muted">Signed</p><p className="font-mono text-lg text-teal">{allDocs.filter((d: any) => d.status === 'signed').length}</p></div>
              <div><p className="font-body text-[11px] uppercase tracking-wider text-dark-muted">Pending</p><p className="font-mono text-lg text-amber-500">{pending.length}</p></div>
            </div>
          </div>
        </div>
      </div>
    </AdvisorLayout>
  );
}

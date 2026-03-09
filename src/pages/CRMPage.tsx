import { useState } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Phone, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdvisorLayout } from '../components/layout/AdvisorLayout';
import { Button } from '../components/ui/Button';
import { Drawer } from '../components/ui/Drawer';
import { useAdvisorStore } from '../store/useAdvisorStore';
import { supabase } from '../lib/supabase';
import { cn, formatINR } from '../lib/utils';

const COLUMNS = [
  { id: 'discovery_scheduled', label: 'Discovery Scheduled' },
  { id: 'discovery_completed', label: 'Discovery Completed' },
  { id: 'proposal_sent', label: 'Proposal Sent' },
  { id: 'negotiating', label: 'Negotiating' },
  { id: 'engaged', label: 'Engaged' },
  { id: 'lost', label: 'Lost' },
];

function LeadCard({ lead, onClick }: { lead: any; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id, data: { stage: lead.stage } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const name = lead.user?.full_name || lead.user_name || 'Lead';
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}
      className="rounded-[12px] bg-dark-surface p-4 cursor-grab active:cursor-grabbing hover:bg-dark-surface-2 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/20 font-body text-xs font-semibold text-teal">{initials}</div>
        <p className="font-body text-sm font-medium text-white truncate flex-1">{name}</p>
      </div>
      {lead.notes && <span className="inline-block rounded-full border border-teal/30 px-2 py-0.5 font-body text-[11px] text-teal mb-2 truncate max-w-full">{lead.notes}</span>}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-dark-muted">
          {lead.created_at ? `${Math.floor((Date.now() - new Date(lead.created_at).getTime()) / 86400000)}d` : '—'}
        </span>
        <span className={cn('rounded-full px-1.5 py-0.5 font-body text-[10px] font-semibold',
          lead.priority === 'high' ? 'bg-red-500/10 text-red-400' :
          lead.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
          'bg-dark-surface-2 text-dark-muted'
        )}>{lead.priority?.toUpperCase() || 'MED'}</span>
      </div>
    </div>
  );
}

export default function CRMPage() {
  const { advisor } = useAdvisorStore();
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [note, setNote] = useState('');

  const { data: leads } = useQuery({
    queryKey: ['crm-leads', advisor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_leads')
        .select('*, user:profiles!user_id(full_name, email, city)')
        .eq('advisor_id', advisor!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!advisor?.id,
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { error } = await supabase.from('crm_leads').update({ stage }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-leads'] }),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const col = COLUMNS.find((c) => c.id === over.id);
    if (col) {
      updateStage.mutate({ id: active.id as string, stage: col.id });
    }
  };

  const allLeads = leads ?? [];

  return (
    <AdvisorLayout>
      <div>
        <h1 className="font-display text-[28px] text-dark-text mb-4">CRM Pipeline</h1>

        <div className="flex flex-wrap gap-4 mb-6 font-body text-sm">
          <span className="text-dark-muted">Total Leads: <span className="text-white font-mono">{allLeads.length}</span></span>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {COLUMNS.map((col) => {
              const colLeads = allLeads.filter((l: any) => l.stage === col.id);
              return (
                <SortableContext key={col.id} id={col.id} items={colLeads.map((l: any) => l.id)} strategy={verticalListSortingStrategy}>
                  <div className="min-w-[220px] w-[220px] flex-shrink-0">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="font-body text-xs font-medium text-dark-muted">{col.label}</span>
                      <span className="font-mono text-[11px] text-dark-muted-2">{colLeads.length}</span>
                    </div>
                    <div className="space-y-2 min-h-[100px] rounded-[12px] bg-dark-base/50 p-2" id={col.id}>
                      {colLeads.map((lead: any) => (
                        <LeadCard key={lead.id} lead={lead} onClick={() => setSelectedLead(lead)} />
                      ))}
                      {colLeads.length === 0 && (
                        <p className="text-center font-body text-[11px] text-dark-muted-2 py-8">No leads</p>
                      )}
                    </div>
                  </div>
                </SortableContext>
              );
            })}
          </div>
        </DndContext>

        <Drawer open={!!selectedLead} onClose={() => setSelectedLead(null)} title={selectedLead?.user?.full_name || ''}>
          {selectedLead && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/20 font-body text-base font-semibold text-teal">
                  {(selectedLead.user?.full_name || 'L').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-body text-base font-medium text-white">{selectedLead.user?.full_name}</p>
                  <p className="font-mono text-xs text-dark-muted">{selectedLead.user?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="dark-outline" size="xs"><Phone className="h-3 w-3 mr-1" /> Call</Button>
                <Button variant="dark-outline" size="xs"><MessageSquare className="h-3 w-3 mr-1" /> Message</Button>
              </div>
              <div className="border-t border-dark-border pt-4">
                <p className="font-body text-[11px] uppercase tracking-wider text-dark-muted mb-2">Profile</p>
                <div className="space-y-1.5 font-body text-sm">
                  {selectedLead.notes && <div className="flex justify-between"><span className="text-dark-muted">Notes</span><span className="text-dark-text">{selectedLead.notes}</span></div>}
                  {selectedLead.user?.city && <div className="flex justify-between"><span className="text-dark-muted">City</span><span className="text-dark-text">{selectedLead.user.city}</span></div>}
                  <div className="flex justify-between"><span className="text-dark-muted">Stage</span><span className="text-dark-text">{selectedLead.stage}</span></div>
                </div>
              </div>
              {selectedLead.notes && (
                <div className="border-t border-dark-border pt-4">
                  <p className="font-body text-[11px] uppercase tracking-wider text-dark-muted mb-2">Notes</p>
                  <p className="font-body text-sm text-dark-muted">{selectedLead.notes}</p>
                </div>
              )}
              <div className="border-t border-dark-border pt-4">
                <p className="font-body text-[11px] uppercase tracking-wider text-dark-muted mb-2">Quick Note</p>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." rows={3} className="w-full rounded-[8px] border border-dark-border bg-dark-base px-3 py-2 font-body text-sm text-dark-text placeholder:text-dark-muted-2 focus:outline-none focus:border-teal resize-none" />
                <Button variant="teal" size="xs" className="mt-2" onClick={async () => {
                  if (note.trim()) {
                    await supabase.from('crm_leads').update({ notes: note }).eq('id', selectedLead.id);
                    queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
                    setNote('');
                  }
                }}>Save Note</Button>
              </div>
              <div className="border-t border-dark-border pt-4 flex gap-2">
                <Button variant="teal" size="sm" onClick={() => {
                  updateStage.mutate({ id: selectedLead.id, stage: 'proposal_sent' });
                  setSelectedLead(null);
                }}>Send Proposal &rarr;</Button>
                <Button variant="danger" size="sm" onClick={() => {
                  updateStage.mutate({ id: selectedLead.id, stage: 'lost' });
                  setSelectedLead(null);
                }}>Mark as Lost</Button>
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </AdvisorLayout>
  );
}

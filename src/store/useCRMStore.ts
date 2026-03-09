import { create } from 'zustand';

export interface Lead {
  id: string;
  name: string;
  initials: string;
  color: string;
  phone: string;
  goal: string;
  goalLabel: string;
  income: string;
  situation: string;
  situationLabel: string;
  stage: string;
  daysInStage: number;
  priority: 'HIGH' | 'MED' | 'LOW';
  discoveryDate?: string;
  notes: string[];
  planName?: string;
  planPrice?: number;
}

export type CRMColumn = 'discovery_scheduled' | 'discovery_completed' | 'proposal_sent' | 'negotiating' | 'engaged' | 'lost';

interface CRMStore {
  leads: Lead[];
  moveLead: (leadId: string, toStage: string) => void;
  updatePriority: (leadId: string, priority: Lead['priority']) => void;
  addNote: (leadId: string, note: string) => void;
}

export const useCRMStore = create<CRMStore>((set) => ({
  leads: [],
  moveLead: (leadId, toStage) =>
    set((s) => ({
      leads: s.leads.map((l) => l.id === leadId ? { ...l, stage: toStage, daysInStage: 0 } : l),
    })),
  updatePriority: (leadId, priority) =>
    set((s) => ({
      leads: s.leads.map((l) => l.id === leadId ? { ...l, priority } : l),
    })),
  addNote: (leadId, note) =>
    set((s) => ({
      leads: s.leads.map((l) => l.id === leadId ? { ...l, notes: [...l.notes, note] } : l),
    })),
}));

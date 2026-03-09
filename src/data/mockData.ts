import type { Lead } from '../store/useCRMStore';

export const ADVISOR_PROFILE = {
  id: '1',
  name: 'Priya Krishnamurthy',
  credentials: 'CFP \u00b7 SEBI RIA',
  sebiNumber: 'INA000012847',
  bio: 'Specialist in financial planning for salaried professionals aged 25\u201338.',
  avatarInitials: 'PK',
  avatarColor: '#00c896',
  yearsExperience: 9,
  city: 'Bangalore',
  rating: 4.9,
  languages: ['English', 'Tamil', 'Hindi'],
  plans: [
    { name: 'Basic', price: 8000, sessions: 2, features: ['Goal planning session', 'Basic tax review', 'Session notes', 'Email support'] },
    { name: 'Standard', price: 18000, sessions: 4, popular: true, features: ['Goal planning + strategy', 'Tax optimisation review', 'Quarterly check-in', 'Chat support', 'Session notes shared'] },
    { name: 'Premium', price: 35000, sessions: 8, features: ['All Standard features', 'Monthly portfolio reviews', 'Insurance audit', 'Priority scheduling', 'Unlimited chat', 'Annual plan doc'] },
  ],
};

export interface Client {
  id: string;
  name: string;
  initials: string;
  color: string;
  plan: string;
  price: number;
  sessionsCompleted: number;
  totalSessions: number;
  kycDone: boolean;
  pendingDocs: number;
  status: 'active' | 'proposed' | 'onboarding';
  engagedSince?: string;
  nextSession?: string;
  email: string;
  phone: string;
  income: string;
  goal: string;
}

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Deepa Nair', initials: 'DN', color: '#0ea5e9', plan: 'Standard', price: 18000, sessionsCompleted: 3, totalSessions: 8, kycDone: true, pendingDocs: 1, status: 'active', engagedSince: 'January 2026', nextSession: 'Tuesday, 18 Mar \u00b7 11:00 AM', email: 'deepa@mail.com', phone: '+91 98765 43210', income: '\u20b910L\u2013\u20b915L', goal: 'Retirement Planning' },
  { id: 'c2', name: 'Arjun Patel', initials: 'AP', color: '#f59e0b', plan: 'Premium', price: 35000, sessionsCompleted: 5, totalSessions: 8, kycDone: true, pendingDocs: 0, status: 'active', engagedSince: 'December 2025', nextSession: 'Friday, 21 Mar \u00b7 3:00 PM', email: 'arjun@mail.com', phone: '+91 98765 43211', income: '\u20b915L\u2013\u20b920L', goal: 'Investment Planning' },
  { id: 'c3', name: 'Sunita Kapoor', initials: 'SK', color: '#ec4899', plan: 'Standard', price: 18000, sessionsCompleted: 1, totalSessions: 4, kycDone: true, pendingDocs: 0, status: 'active', engagedSince: 'February 2026', email: 'sunita@mail.com', phone: '+91 98765 43212', income: '\u20b98L\u2013\u20b910L', goal: 'Tax Planning' },
  { id: 'c4', name: 'Rahul Mehta', initials: 'RM', color: '#8b5cf6', plan: 'Standard', price: 18000, sessionsCompleted: 0, totalSessions: 4, kycDone: false, pendingDocs: 2, status: 'onboarding', email: 'rahul@mail.com', phone: '+91 98765 43213', income: '\u20b910L\u2013\u20b915L', goal: 'Retirement Planning' },
  { id: 'c5', name: 'Kiran Thakur', initials: 'KT', color: '#14b8a6', plan: 'Basic', price: 8000, sessionsCompleted: 0, totalSessions: 2, kycDone: false, pendingDocs: 3, status: 'onboarding', email: 'kiran@mail.com', phone: '+91 98765 43214', income: '\u20b95L\u2013\u20b98L', goal: 'Goal Planning' },
];

export interface DocStatus {
  id: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  documentName: string;
  status: 'signed' | 'pending' | 'overdue' | 'not_sent';
  daysPending?: number;
  signedDate?: string;
  docuSignRef?: string;
}

export const MOCK_DOCUMENTS: DocStatus[] = [
  { id: 'doc1', clientId: 'c1', clientName: 'Deepa Nair', clientInitials: 'DN', documentName: 'Risk Assessment Form', status: 'pending', daysPending: 5 },
  { id: 'doc2', clientId: 'c4', clientName: 'Rahul Mehta', clientInitials: 'RM', documentName: 'Engagement Agreement', status: 'pending', daysPending: 3 },
  { id: 'doc3', clientId: 'c5', clientName: 'Sunita Kapoor', clientInitials: 'SK', documentName: 'Fee Disclosure', status: 'overdue', daysPending: 8 },
  { id: 'doc4', clientId: 'c2', clientName: 'Arjun Patel', clientInitials: 'AP', documentName: 'All documents', status: 'signed', signedDate: '10 Jan 2026' },
  { id: 'doc5', clientId: 'c5', clientName: 'Kiran Thakur', clientInitials: 'KT', documentName: 'KYC verification', status: 'overdue', daysPending: 6 },
  { id: 'doc6', clientId: 'c1', clientName: 'Deepa Nair', clientInitials: 'DN', documentName: 'Engagement Agreement', status: 'signed', signedDate: '15 Jan 2026', docuSignRef: 'DS-489201' },
  { id: 'doc7', clientId: 'c1', clientName: 'Deepa Nair', clientInitials: 'DN', documentName: 'Fee Disclosure', status: 'signed', signedDate: '16 Jan 2026', docuSignRef: 'DS-489205' },
];

export const MOCK_TEMPLATES = [
  { id: 't1', name: 'Engagement Agreement', usedWith: 18, signed: 18, pending: 0 },
  { id: 't2', name: 'Fee Disclosure Document', usedWith: 18, signed: 17, pending: 1 },
  { id: 't3', name: 'Risk Assessment Form', usedWith: 15, signed: 13, pending: 2 },
];

export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  clientColor: string;
  type: 'discovery' | 'session';
  sessionNumber?: number;
  totalSessions?: number;
  planName?: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'completed';
  notes?: string;
}

export const MOCK_SESSIONS: Session[] = [
  { id: 's1', clientId: 'c4', clientName: 'Rahul Mehta', clientInitials: 'RM', clientColor: '#8b5cf6', type: 'discovery', date: 'Today', time: '3:00 PM', duration: '60 min', status: 'upcoming' },
  { id: 's2', clientId: 'c1', clientName: 'Deepa Nair', clientInitials: 'DN', clientColor: '#0ea5e9', type: 'session', sessionNumber: 4, totalSessions: 8, planName: 'Standard', date: 'Today', time: '5:30 PM', duration: '60 min', status: 'upcoming' },
  { id: 's3', clientId: 'c1', clientName: 'Deepa Nair', clientInitials: 'DN', clientColor: '#0ea5e9', type: 'session', sessionNumber: 3, totalSessions: 8, planName: 'Standard', date: '5 Mar 2026', time: '11:00 AM', duration: '60 min', status: 'completed', notes: 'Discussed rebalancing equity exposure. Client concerned about IT sector concentration.' },
  { id: 's4', clientId: 'c2', clientName: 'Arjun Patel', clientInitials: 'AP', clientColor: '#f59e0b', type: 'session', sessionNumber: 5, totalSessions: 8, planName: 'Premium', date: '3 Mar 2026', time: '3:00 PM', duration: '60 min', status: 'completed', notes: 'Quarterly review. Adjusted SIP allocation and reviewed insurance coverage.' },
];

export const MOCK_LEADS: Lead[] = [
  { id: 'l1', name: 'Rahul Mehta', initials: 'RM', color: '#8b5cf6', phone: '+91 98765 43213', goal: 'retirement_planning', goalLabel: 'Retirement', income: '\u20b910L\u2013\u20b915L', situation: 'retirement_planning', situationLabel: 'Pre-retirement', stage: 'discovery_scheduled', daysInStage: 2, priority: 'HIGH', notes: [] },
  { id: 'l2', name: 'Meera Sharma', initials: 'MS', color: '#f97316', phone: '+91 98765 43220', goal: 'investment_plan', goalLabel: 'Investment', income: '\u20b95L\u2013\u20b98L', situation: 'confused_investor', situationLabel: 'Confused investor', stage: 'discovery_scheduled', daysInStage: 0, priority: 'MED', notes: [] },
  { id: 'l3', name: 'Vikram Das', initials: 'VD', color: '#0ea5e9', phone: '+91 98765 43221', goal: 'tax_reduction', goalLabel: 'Tax Planning', income: '\u20b915L\u2013\u20b920L', situation: 'big_decision', situationLabel: 'Big decision', stage: 'discovery_scheduled', daysInStage: 1, priority: 'MED', notes: [] },
  { id: 'l4', name: 'Priya Singh', initials: 'PS', color: '#ec4899', phone: '+91 98765 43222', goal: 'retirement', goalLabel: 'Retirement', income: '\u20b98L\u2013\u20b910L', situation: 'retirement_planning', situationLabel: 'Pre-retirement', stage: 'discovery_completed', daysInStage: 2, priority: 'HIGH', discoveryDate: '5 Mar 2026', notes: ['Interested in retirement corpus calculation. Wants clear numbers.'] },
  { id: 'l5', name: 'Ankit Joshi', initials: 'AJ', color: '#14b8a6', phone: '+91 98765 43223', goal: 'investment_plan', goalLabel: 'Investment', income: '\u20b910L\u2013\u20b915L', situation: 'confused_investor', situationLabel: 'Confused investor', stage: 'discovery_completed', daysInStage: 1, priority: 'MED', discoveryDate: '6 Mar 2026', notes: [] },
  { id: 'l6', name: 'Sunita Kapoor', initials: 'SK', color: '#ec4899', phone: '+91 98765 43212', goal: 'tax_reduction', goalLabel: 'Tax Planning', income: '\u20b98L\u2013\u20b910L', situation: 'big_decision', situationLabel: 'Big decision', stage: 'proposal_sent', daysInStage: 1, priority: 'MED', notes: [] },
  { id: 'l7', name: 'Kiran Thakur', initials: 'KT', color: '#14b8a6', phone: '+91 98765 43214', goal: 'retirement', goalLabel: 'Retirement', income: '\u20b95L\u2013\u20b98L', situation: 'retirement_planning', situationLabel: 'Pre-retirement', stage: 'proposal_sent', daysInStage: 3, priority: 'MED', notes: [] },
  { id: 'l8', name: 'Arjun Patel', initials: 'AP', color: '#f59e0b', phone: '+91 98765 43211', goal: 'investment_plan', goalLabel: 'Investment', income: '\u20b915L\u2013\u20b920L', situation: 'big_decision', situationLabel: 'Big decision', stage: 'negotiating', daysInStage: 5, priority: 'HIGH', notes: ['Wants to compare Premium vs Standard. Scheduled follow-up.'] },
  { id: 'l9', name: 'Deepa Nair', initials: 'DN', color: '#0ea5e9', phone: '+91 98765 43210', goal: 'retirement', goalLabel: 'Retirement', income: '\u20b910L\u2013\u20b915L', situation: 'retirement_planning', situationLabel: 'Pre-retirement', stage: 'engaged', daysInStage: 60, priority: 'LOW', planName: 'Standard', planPrice: 18000, notes: [] },
  { id: 'l10', name: 'Nisha Gupta', initials: 'NG', color: '#a855f7', phone: '+91 98765 43230', goal: 'insurance', goalLabel: 'Insurance', income: '\u20b93L\u2013\u20b95L', situation: 'new_earner', situationLabel: 'New earner', stage: 'lost', daysInStage: 10, priority: 'LOW', notes: ['Budget constraints. Revisit in 6 months.'] },
  { id: 'l11', name: 'Ravi Kumar', initials: 'RK', color: '#64748b', phone: '+91 98765 43231', goal: 'debt', goalLabel: 'Debt', income: '\u20b93L\u2013\u20b95L', situation: 'new_earner', situationLabel: 'New earner', stage: 'lost', daysInStage: 15, priority: 'LOW', notes: ['Referred to debt counselor.'] },
];

export const MOCK_PRIORITY_ITEMS = [
  { id: 'p1', type: 'doc', color: '#ef4444', icon: 'FileText', text: "Rahul Mehta hasn't signed the Engagement Agreement. Sent 3 days ago.", action: 'Send Reminder', clientId: 'c4' },
  { id: 'p2', type: 'proposal', color: '#f59e0b', icon: 'Clock', text: 'Priya Singh completed her discovery call 2 days ago. No proposal sent yet.', action: 'Send Proposal', clientId: null },
  { id: 'p3', type: 'renewal', color: '#f59e0b', icon: 'Calendar', text: "Ankit Joshi's Standard Plan renews in 14 days. Consider a check-in.", action: 'Send Renewal', clientId: null },
  { id: 'p4', type: 'kyc', color: '#00c896', icon: 'Check', text: 'Deepa Nair completed KYC. Session 1 is now unlocked and she can book.', action: 'View Client', clientId: 'c1' },
];

export const MOCK_EARNINGS = {
  allTime: 284000,
  thisMonth: 84000,
  pendingPayout: 35000,
  activeClients: 18,
  monthly: [
    { month: 'Apr', amount: 18000 }, { month: 'May', amount: 18000 }, { month: 'Jun', amount: 26000 },
    { month: 'Jul', amount: 18000 }, { month: 'Aug', amount: 36000 }, { month: 'Sep', amount: 18000 },
    { month: 'Oct', amount: 26000 }, { month: 'Nov', amount: 36000 }, { month: 'Dec', amount: 18000 },
    { month: 'Jan', amount: 36000 }, { month: 'Feb', amount: 50000 }, { month: 'Mar', amount: 84000 },
  ],
  renewals: [
    { clientName: 'Kiran T.', plan: 'Standard Plan', expires: 'Mar 28', daysLeft: 14 },
    { clientName: 'Meera S.', plan: 'Basic Plan', expires: 'Apr 5', daysLeft: 21 },
  ],
  payouts: [
    { date: '1 Mar 2026', amount: 35000, ref: 'PAY-2026030101', status: 'Processing' },
    { date: '1 Feb 2026', amount: 28000, ref: 'PAY-2026020101', status: 'Paid' },
    { date: '1 Jan 2026', amount: 36000, ref: 'PAY-2026010101', status: 'Paid' },
  ],
};

export const MOCK_CONVERSATIONS = [
  { id: 'mc1', clientName: 'Deepa Nair', clientInitials: 'DN', clientColor: '#0ea5e9', lastMessage: 'Sure, I\u2019ll share the updated portfolio before our session.', time: '2m ago', unread: 2, pinned: true },
  { id: 'mc2', clientName: 'Arjun Patel', clientInitials: 'AP', clientColor: '#f59e0b', lastMessage: 'Thanks for the tax report, really helpful!', time: '1h ago', unread: 1, pinned: false },
  { id: 'mc3', clientName: 'Sunita Kapoor', clientInitials: 'SK', clientColor: '#ec4899', lastMessage: 'When is our next session?', time: '3h ago', unread: 0, pinned: false },
];

export const MOCK_ACTIVITY = [
  { text: 'Deepa Nair accepted Standard Plan \u00b7 \u20b918,000', time: '2h ago' },
  { text: 'New \u2b50\u2b50\u2b50\u2b50\u2b50 review from Rahul Mehta', time: 'Yesterday' },
  { text: 'Sunita K. completed DigiLocker KYC', time: 'Yesterday' },
  { text: '3 new leads matched to your profile', time: '2 days ago' },
];

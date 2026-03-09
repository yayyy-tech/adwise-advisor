import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, X, Upload } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { useAdvisorStore } from '../store/useAdvisorStore';
import { cn } from '../lib/utils';

const TOTAL_STEPS = 8;
const SPECIALIZATIONS = [
  { id: 'investment_strategy', label: 'Investment Planning', emoji: '\ud83c\udfaf' },
  { id: 'tax_planning', label: 'Tax Planning', emoji: '\ud83d\udcb0' },
  { id: 'retirement_planning', label: 'Retirement', emoji: '\ud83c\udfd6\ufe0f' },
  { id: 'insurance_review', label: 'Insurance', emoji: '\ud83d\udee1\ufe0f' },
  { id: 'goal_planning', label: 'Goal Planning', emoji: '\ud83c\udfe0' },
  { id: 'nri_planning', label: 'NRI Planning', emoji: '\ud83c\udf0d' },
  { id: 'debt_management', label: 'Debt Management', emoji: '\ud83d\udcb3' },
  { id: 'mutual_fund_review', label: 'Portfolio Review', emoji: '\ud83d\udd0d' },
  { id: 'second_opinion', label: 'Second Opinion', emoji: '\ud83e\uddd0' },
];
const TEMPLATES = [
  { name: 'Engagement Agreement', desc: 'SEBI-compliant template. Covers: scope, fees, terms', tag: 'SEBI Compliant' },
  { name: 'Fee Disclosure Document', desc: 'SEBI Mandatory. Required by regulation', tag: 'SEBI Mandatory' },
  { name: 'Risk Assessment Form', desc: 'Recommended. Understand client risk profile', tag: 'Recommended' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setProfileCompleted, onboardingStep, setOnboardingStep, name } = useAdvisorStore();
  const [dir, setDir] = useState(1);
  const step = onboardingStep;

  // Local state
  const [bio, setBio] = useState('');
  const [tagline, setTagline] = useState('');
  const [specs, setSpecs] = useState<string[]>([]);
  const [primarySpec, setPrimarySpec] = useState('');
  const [plans, setPlans] = useState([
    { name: 'Basic', price: 8000, sessions: 2, features: ['Goal planning session', 'Basic tax review'] },
    { name: 'Standard', price: 18000, sessions: 4, features: ['Goal planning + strategy', 'Tax optimisation review', 'Quarterly check-in', 'Chat support'] },
    { name: 'Premium', price: 35000, sessions: 8, features: ['All Standard features', 'Monthly portfolio reviews', 'Insurance audit', 'Priority scheduling'] },
  ]);
  const [availability, setAvailability] = useState(
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => ({ day: d, on: true, from: '09:00', to: '18:00' }))
      .concat(['Sat', 'Sun'].map((d) => ({ day: d, on: false, from: '09:00', to: '18:00' })))
  );
  const [slotDuration, setSlotDuration] = useState(60);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [pwStrength, setPwStrength] = useState(0);

  const goNext = () => { setDir(1); if (step < TOTAL_STEPS) setOnboardingStep(step + 1); else { setProfileCompleted(true); navigate('/dashboard'); } };
  const goBack = () => { setDir(-1); if (step > 1) setOnboardingStep(step - 1); };

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h2 className="font-display text-[28px] text-white">Welcome to Adwise, {name.split(' ')[0]}.</h2>
            <p className="mt-2 font-body text-sm text-dark-muted">Let's set your new password.</p>
          </div>
          <input type="password" placeholder="Current (temporary) password" className="h-12 w-full rounded-[12px] border border-dark-border bg-dark-base px-4 font-body text-sm text-dark-text placeholder:text-dark-muted-2 focus:border-teal focus:outline-none" />
          <div>
            <input type="password" placeholder="New password" onChange={(e) => setPwStrength(e.target.value.length >= 8 ? (e.target.value.length >= 12 ? 3 : 2) : 1)} className="h-12 w-full rounded-[12px] border border-dark-border bg-dark-base px-4 font-body text-sm text-dark-text placeholder:text-dark-muted-2 focus:border-teal focus:outline-none" />
            <div className="mt-2 flex gap-1">
              {[1, 2, 3].map((i) => <div key={i} className={cn('h-1 flex-1 rounded-full', i <= pwStrength ? (pwStrength === 1 ? 'bg-red-500' : pwStrength === 2 ? 'bg-amber-500' : 'bg-teal') : 'bg-dark-border')} />)}
            </div>
            <p className="mt-1 font-body text-[11px] text-dark-muted">{pwStrength === 0 ? '' : pwStrength === 1 ? 'Weak' : pwStrength === 2 ? 'Fair' : 'Strong'}</p>
          </div>
          <input type="password" placeholder="Confirm new password" className="h-12 w-full rounded-[12px] border border-dark-border bg-dark-base px-4 font-body text-sm text-dark-text placeholder:text-dark-muted-2 focus:border-teal focus:outline-none" />
        </div>
      );
      case 2: return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-4">
            <h2 className="font-display text-[28px] text-white">Your Public Profile</h2>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-dark-border bg-dark-surface-2 text-dark-muted"><Upload className="h-6 w-6" /></div>
              <p className="font-body text-xs text-dark-muted">Upload profile photo</p>
            </div>
            <div>
              <label className="font-body text-xs text-dark-muted mb-1 block">Bio ({bio.length}/500)</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 500))} placeholder="Tell potential clients about yourself..." rows={4} className="w-full rounded-[12px] border border-dark-border bg-dark-base px-4 py-3 font-body text-sm text-dark-text placeholder:text-dark-muted-2 focus:border-teal focus:outline-none resize-none" />
            </div>
            <div>
              <label className="font-body text-xs text-dark-muted mb-1 block">Tagline ({tagline.length}/160)</label>
              <input value={tagline} onChange={(e) => setTagline(e.target.value.slice(0, 160))} placeholder="Short tagline for your profile card" className="h-12 w-full rounded-[12px] border border-dark-border bg-dark-base px-4 font-body text-sm text-dark-text placeholder:text-dark-muted-2 focus:border-teal focus:outline-none" />
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="font-body text-[11px] uppercase tracking-wider text-dark-muted mb-3">Live Preview</p>
            <div className="rounded-[20px] bg-dark-surface p-5 border border-dark-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal font-body text-sm font-semibold text-dark-base">PK</div>
                <div>
                  <p className="font-body text-sm font-medium text-white">{name}</p>
                  <p className="font-mono text-[11px] text-dark-muted">CFP \u00b7 SEBI RIA</p>
                </div>
              </div>
              <p className="font-display italic text-sm text-dark-muted">{tagline || 'Your tagline appears here...'}</p>
              <p className="mt-2 font-body text-xs text-dark-muted line-clamp-3">{bio || 'Your bio appears here...'}</p>
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div className="max-w-lg mx-auto space-y-6">
          <h2 className="font-display text-[28px] text-white">Credentials</h2>
          <div>
            <label className="font-body text-xs text-dark-muted mb-1 block">SEBI Registration Number</label>
            <div className="flex items-center gap-2">
              <input value="INA000012847" readOnly className="h-12 flex-1 rounded-[12px] border border-dark-border bg-dark-surface px-4 font-mono text-sm text-dark-muted" />
              <span className="flex items-center gap-1 text-teal font-body text-xs"><Check className="h-4 w-4" /> Verified</span>
            </div>
          </div>
          <div>
            <label className="font-body text-xs text-dark-muted mb-1 block">Qualifications</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input value="CFP" readOnly className="h-10 flex-1 rounded-[8px] border border-dark-border bg-dark-base px-3 font-body text-sm text-dark-text" />
                <input value="CFA Institute" readOnly className="h-10 flex-1 rounded-[8px] border border-dark-border bg-dark-base px-3 font-body text-sm text-dark-text" />
                <input value="2018" readOnly className="h-10 w-20 rounded-[8px] border border-dark-border bg-dark-base px-3 font-body text-sm text-dark-text" />
              </div>
              <button className="flex items-center gap-1 font-body text-xs text-teal"><Plus className="h-3 w-3" /> Add qualification</button>
            </div>
          </div>
          <div>
            <label className="font-body text-xs text-dark-muted mb-1 block">Years of Experience</label>
            <input type="number" value={9} readOnly className="h-12 w-24 rounded-[12px] border border-dark-border bg-dark-base px-4 font-mono text-sm text-dark-text" />
          </div>
          <div>
            <label className="font-body text-xs text-dark-muted mb-1 block">Languages</label>
            <div className="flex gap-2">
              {['English', 'Tamil', 'Hindi'].map((l) => (
                <span key={l} className="flex items-center gap-1 rounded-full bg-dark-surface-2 px-3 py-1 font-body text-xs text-dark-text">{l} <X className="h-3 w-3 text-dark-muted cursor-pointer" /></span>
              ))}
            </div>
          </div>
        </div>
      );
      case 4: return (
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-display text-[28px] text-white">Your Specialisations</h2>
          <p className="font-body text-sm text-dark-muted">Which types of clients do you do your best work with?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SPECIALIZATIONS.map((s) => (
              <button key={s.id} onClick={() => setSpecs((p) => p.includes(s.id) ? p.filter((x) => x !== s.id) : [...p, s.id])} className={cn('flex flex-col items-start gap-2 rounded-[12px] border p-4 text-left transition-colors', specs.includes(s.id) ? 'border-teal bg-teal/5' : 'border-dark-border bg-dark-surface hover:bg-dark-surface-2')}>
                <span className="text-xl">{s.emoji}</span>
                <span className="font-body text-sm text-dark-text">{s.label}</span>
              </button>
            ))}
          </div>
          {specs.length > 0 && (
            <div>
              <p className="font-body text-sm text-dark-muted mb-2">Primary specialisation:</p>
              <div className="flex flex-wrap gap-2">
                {specs.map((s) => {
                  const sp = SPECIALIZATIONS.find((x) => x.id === s);
                  return (
                    <button key={s} onClick={() => setPrimarySpec(s)} className={cn('rounded-full border px-3 py-1.5 font-body text-xs transition-colors', primarySpec === s ? 'border-teal bg-teal text-dark-base' : 'border-dark-border text-dark-text')}>
                      {sp?.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <p className="font-body text-xs text-dark-muted">Clients with these goals will be matched to you first.</p>
        </div>
      );
      case 5: return (
        <div className="space-y-6">
          <h2 className="font-display text-[28px] text-white">Configure Your Service Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan, pi) => (
              <div key={pi} className={cn('rounded-[20px] bg-dark-surface p-6 border', pi === 1 ? 'border-teal' : 'border-dark-border')}>
                {pi === 1 && <span className="block mb-2 rounded-full bg-teal px-2 py-0.5 font-body text-[10px] font-semibold text-dark-base w-fit">MOST POPULAR</span>}
                <input value={plan.name} onChange={(e) => { const p = [...plans]; p[pi].name = e.target.value; setPlans(p); }} className="h-10 w-full rounded-[8px] border border-dark-border bg-dark-base px-3 font-body text-sm text-dark-text mb-2" />
                <div className="flex items-center gap-1 mb-2">
                  <span className="font-body text-xs text-dark-muted">{'\u20b9'}</span>
                  <input type="number" value={plan.price} onChange={(e) => { const p = [...plans]; p[pi].price = +e.target.value; setPlans(p); }} className="h-10 flex-1 rounded-[8px] border border-dark-border bg-dark-base px-3 font-mono text-sm text-dark-text" />
                  <span className="font-body text-xs text-dark-muted">/ year</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-body text-xs text-dark-muted">Sessions:</span>
                  <input type="number" value={plan.sessions} onChange={(e) => { const p = [...plans]; p[pi].sessions = +e.target.value; setPlans(p); }} className="h-8 w-16 rounded-[6px] border border-dark-border bg-dark-base px-2 font-mono text-xs text-dark-text" />
                </div>
                <div className="space-y-1">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-teal flex-shrink-0" />
                      <input value={f} onChange={(e) => { const p = [...plans]; p[pi].features[fi] = e.target.value; setPlans(p); }} className="flex-1 bg-transparent font-body text-xs text-dark-muted focus:outline-none focus:text-dark-text" />
                    </div>
                  ))}
                  <button onClick={() => { const p = [...plans]; p[pi].features.push(''); setPlans(p); }} className="flex items-center gap-1 font-body text-[11px] text-teal mt-1"><Plus className="h-3 w-3" /> Add feature</button>
                </div>
              </div>
            ))}
          </div>
          <p className="font-body text-xs text-dark-muted">Your plans are only shown to clients after they complete a free discovery call with you.</p>
        </div>
      );
      case 6: return (
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-display text-[28px] text-white">Your Availability</h2>
          <div className="rounded-[16px] bg-dark-surface p-5 border border-dark-border">
            <div className="grid grid-cols-[60px_40px_1fr_1fr] gap-3 items-center mb-2">
              <span /><span /><span className="font-body text-[11px] text-dark-muted">From</span><span className="font-body text-[11px] text-dark-muted">To</span>
            </div>
            {availability.map((day, i) => (
              <div key={day.day} className="grid grid-cols-[60px_40px_1fr_1fr] gap-3 items-center py-1.5">
                <span className="font-body text-sm text-dark-text">{day.day}</span>
                <button onClick={() => { const a = [...availability]; a[i].on = !a[i].on; setAvailability(a); }} className={cn('h-5 w-9 rounded-full transition-colors relative', day.on ? 'bg-teal' : 'bg-dark-border')}>
                  <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform', day.on ? 'left-4' : 'left-0.5')} />
                </button>
                {day.on ? (
                  <>
                    <input value={day.from} onChange={(e) => { const a = [...availability]; a[i].from = e.target.value; setAvailability(a); }} className="h-9 rounded-[8px] border border-dark-border bg-dark-base px-3 font-mono text-xs text-dark-text" />
                    <input value={day.to} onChange={(e) => { const a = [...availability]; a[i].to = e.target.value; setAvailability(a); }} className="h-9 rounded-[8px] border border-dark-border bg-dark-base px-3 font-mono text-xs text-dark-text" />
                  </>
                ) : <><span className="font-body text-xs text-dark-muted-2">&mdash;</span><span /></>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-body text-sm text-dark-muted">Slot duration:</span>
            <div className="flex gap-2">
              {[30, 45, 60, 90].map((d) => (
                <button key={d} onClick={() => setSlotDuration(d)} className={cn('rounded-full px-3 py-1 font-body text-xs transition-colors', slotDuration === d ? 'bg-teal text-dark-base' : 'border border-dark-border text-dark-muted')}>
                  {d} min
                </button>
              ))}
            </div>
          </div>
        </div>
      );
      case 7: return (
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-display text-[28px] text-white">Upload Document Templates</h2>
          <p className="font-body text-sm text-dark-muted">These are sent automatically to every new client when they sign up for your plan.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TEMPLATES.map((t) => (
              <div key={t.name} className={cn('rounded-[16px] border p-5 transition-colors', selectedTemplates.includes(t.name) ? 'border-teal bg-teal/5' : 'border-dark-border bg-dark-surface')}>
                <span className="text-xl">&#128196;</span>
                <p className="mt-2 font-body text-sm font-medium text-white">{t.name}</p>
                <span className="mt-1 inline-block rounded-full bg-dark-surface-2 px-2 py-0.5 font-body text-[10px] text-dark-muted">{t.tag}</span>
                <p className="mt-2 font-body text-xs text-dark-muted">{t.desc}</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="ghost" size="xs">Preview</Button>
                  <Button variant={selectedTemplates.includes(t.name) ? 'teal' : 'dark-outline'} size="xs" onClick={() => setSelectedTemplates((p) => p.includes(t.name) ? p.filter((x) => x !== t.name) : [...p, t.name])}>
                    {selectedTemplates.includes(t.name) ? 'Selected \u2713' : 'Use This'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[16px] border-2 border-dashed border-dark-border p-8 text-center">
            <Upload className="h-8 w-8 text-dark-muted mx-auto mb-2" />
            <p className="font-body text-sm text-dark-muted">Upload your own documents</p>
            <p className="font-body text-xs text-dark-muted-2">PDF, DOCX</p>
          </div>
        </div>
      );
      case 8: return (
        <div className="max-w-md mx-auto text-center py-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ type: 'spring', bounce: 0.5 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal mb-6">
            <Check className="h-8 w-8 text-dark-base" />
          </motion.div>
          <h2 className="font-display text-4xl text-white">Your Adwise profile is live.</h2>
          <p className="mt-3 font-body text-base text-dark-muted">You&apos;re now visible to matched clients across India.</p>
          <div className="mt-8 rounded-[20px] bg-dark-surface p-5 border border-dark-border mx-auto max-w-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal font-body text-sm font-semibold text-dark-base">PK</div>
              <div className="text-left">
                <p className="font-body text-sm font-medium text-white">{name}</p>
                <p className="font-mono text-[11px] text-dark-muted">CFP \u00b7 SEBI RIA \u00b7 \u2713 Verified</p>
              </div>
            </div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-base p-6 md:p-10 noise-bg">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Logo dark />
          <span className="font-body text-xs text-dark-muted">Step {step} of {TOTAL_STEPS}</span>
        </div>
        <div className="mb-8 h-1 w-full rounded-full bg-dark-border overflow-hidden">
          <motion.div className="h-full bg-teal rounded-full" animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }} transition={{ duration: 0.3 }}>
            {renderStep()}
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex items-center justify-between max-w-2xl mx-auto">
          {step > 1 ? <button onClick={goBack} className="font-body text-sm text-dark-muted hover:text-white">&larr; Back</button> : <span />}
          <Button variant={step === TOTAL_STEPS ? 'teal' : 'primary'} onClick={goNext}>
            {step === TOTAL_STEPS ? 'Go to My Dashboard \u2192' : step === 1 ? 'Set Password \u2192' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}

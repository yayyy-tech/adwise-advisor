import { cn } from '../../lib/utils';

export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 border-b border-dark-border">
      {tabs.map((tab) => (
        <button key={tab} onClick={() => onChange(tab)} className={cn('px-4 py-2.5 font-body text-sm font-medium transition-colors border-b-2 -mb-px', active === tab ? 'border-teal text-white' : 'border-transparent text-dark-muted hover:text-white')}>
          {tab}
        </button>
      ))}
    </div>
  );
}

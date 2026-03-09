import { cn } from '../../lib/utils';

export function Logo({ dark, className }: { dark?: boolean; className?: string }) {
  return (
    <span className={cn('font-body text-xl font-semibold', className)}>
      <span className={dark ? 'text-white' : 'text-light-text'}>Ad</span>
      <span className="text-teal">wise</span>
    </span>
  );
}

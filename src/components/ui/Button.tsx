import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'teal' | 'outline' | 'ghost' | 'dark-outline' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-body font-medium transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed';
    const variants: Record<string, string> = {
      primary: 'bg-dark-surface-2 text-white hover:bg-dark-border disabled:opacity-50',
      teal: 'bg-teal text-dark-base hover:bg-teal-dim disabled:bg-dark-surface disabled:text-dark-muted',
      outline: 'bg-white border border-light-border text-light-text hover:bg-light-base disabled:opacity-50',
      ghost: 'bg-transparent text-dark-muted hover:text-white disabled:opacity-50',
      'dark-outline': 'bg-transparent border border-dark-border text-dark-text hover:bg-dark-surface-2 disabled:opacity-50',
      danger: 'bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50',
    };
    const sizes: Record<string, string> = {
      xs: 'h-7 px-2.5 text-[11px] rounded-[6px] gap-1',
      sm: 'h-9 px-4 text-[13px] rounded-[8px] gap-1.5',
      md: 'h-11 px-5 text-[14px] rounded-[12px] gap-2',
      lg: 'h-[52px] px-8 text-[16px] rounded-[12px] gap-2',
    };

    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)} disabled={disabled || loading} {...props}>
        {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

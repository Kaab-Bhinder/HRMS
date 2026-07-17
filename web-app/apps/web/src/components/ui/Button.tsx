import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
  secondary: 'bg-surface-2 text-foreground hover:bg-muted border border-border',
  outline: 'border border-border bg-transparent text-foreground hover:bg-surface-2',
  ghost: 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
  danger: 'bg-danger text-white hover:bg-danger/90 shadow-sm',
  subtle: 'bg-primary/10 text-primary hover:bg-primary/15',
};
const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9.5 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  icon: 'h-9 w-9 justify-center',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        size === 'md' && 'h-9',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

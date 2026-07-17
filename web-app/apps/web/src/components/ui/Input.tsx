import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

const base =
  'w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:opacity-50';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, leftIcon, invalid, ...props }, ref) => {
  if (leftIcon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{leftIcon}</span>
        <input ref={ref} className={cn(base, 'h-9 pl-9', invalid && 'border-danger focus-visible:ring-danger', className)} {...props} />
      </div>
    );
  }
  return <input ref={ref} className={cn(base, 'h-9', invalid && 'border-danger focus-visible:ring-danger', className)} {...props} />;
});
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(base, 'min-h-[80px] py-2', className)} {...props} />
));
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, InputHTMLAttributes<HTMLSelectElement> & { children: ReactNode; invalid?: boolean }>(
  ({ className, children, invalid, ...props }, ref) => (
    <select ref={ref} className={cn(base, 'h-9 cursor-pointer appearance-none bg-[right_0.6rem_center] bg-no-repeat pr-9', invalid && 'border-danger focus-visible:ring-danger', className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export function Label({ children, htmlFor, required, className }: { children: ReactNode; htmlFor?: string; required?: boolean; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('mb-1.5 block text-sm font-medium text-foreground', className)}>
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  );
}

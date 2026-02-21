import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'md', isLoading, children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

        const variants = {
            default: 'bg-[hsl(var(--primary))] text-white shadow-lg shadow-[hsl(var(--primary)/0.2)] hover:opacity-90',
            primary: 'bg-[hsl(var(--primary))] text-white shadow-lg shadow-[hsl(var(--primary)/0.2)] hover:opacity-90',
            secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] shadow-sm hover:bg-[hsl(var(--secondary)/80)]',
            outline: 'border border-[hsl(var(--border))] bg-transparent shadow-sm hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]',
            ghost: 'hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]',
            destructive: 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600',
        };

        const sizes = {
            sm: 'h-8 rounded-md px-3 text-xs',
            md: 'h-9 px-4 py-2',
            lg: 'h-10 rounded-[1rem] px-8',
            icon: 'h-9 w-9',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Loading...</span>
                    </div>
                ) : children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };

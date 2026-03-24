import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          'tracking-wide uppercase text-sm',
          
          // Variants
          {
            'bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-900':
              variant === 'primary',
            'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-500':
              variant === 'secondary',
            'hover:bg-gray-100 text-gray-900': variant === 'ghost',
            'border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white':
              variant === 'outline',
          },
          
          // Sizes
          {
            'px-4 py-2 text-xs': size === 'sm',
            'px-6 py-3 text-sm': size === 'md',
            'px-8 py-4 text-base': size === 'lg',
          },
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };


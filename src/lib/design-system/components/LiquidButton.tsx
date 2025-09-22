import React from 'react';
import { cn } from '../utils';
import { Slot } from '@radix-ui/react-slot';

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'default' | 'round' | 'liquid';
  glow?: boolean;
  shimmer?: boolean;
  asChild?: boolean;
  children: React.ReactNode;
}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    shape = 'default',
    glow = false,
    shimmer = false,
    asChild = false,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const baseClasses = cn(
      "relative inline-flex items-center justify-center font-medium transition-all duration-300 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
      "disabled:pointer-events-none disabled:opacity-50",
      "overflow-hidden group",
      
      // Variants
      {
        "liquid-glass text-foreground hover:liquid-glass-strong border-0": variant === 'primary',
        "liquid-glass-strong text-foreground hover:liquid-glass-tertiary border-0": variant === 'secondary',
        "bg-transparent hover:liquid-glass text-foreground border-0": variant === 'ghost',
        "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30": variant === 'destructive',
      },
      
      // Sizes
      {
        "h-8 px-3 text-sm": size === 'sm',
        "h-10 px-4 text-sm": size === 'md',
        "h-12 px-6 text-base": size === 'lg',
        "h-14 px-8 text-lg": size === 'xl',
      },
      
      // Shapes
      {
        "rounded-xl": shape === 'default',
        "rounded-full": shape === 'round',
        "rounded-liquid": shape === 'liquid',
      },
      
      // Effects
      {
        "shadow-neon": glow,
        "shimmer": shimmer,
      }
    );

    return (
      <Comp
        className={cn(baseClasses, className)}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {/* Gradient overlay for enhanced glass effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
        
        {/* Shimmer effect */}
        {shimmer && (
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
      </Comp>
    );
  }
);

LiquidButton.displayName = "LiquidButton";

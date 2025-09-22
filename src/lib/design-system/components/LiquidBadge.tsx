import React from 'react';
import { cn } from '../utils';

interface LiquidBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'default' | 'pill' | 'liquid';
  glow?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

export const LiquidBadge = React.forwardRef<HTMLSpanElement, LiquidBadgeProps>(
  ({ 
    className, 
    variant = 'default',
    size = 'md',
    shape = 'default',
    glow = false,
    pulse = false,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = cn(
      "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out",
      "border backdrop-blur-xl",
      
      // Sizes
      {
        "px-2 py-0.5 text-xs": size === 'sm',
        "px-2.5 py-1 text-sm": size === 'md',
        "px-3 py-1.5 text-base": size === 'lg',
      },
      
      // Shapes
      {
        "rounded-lg": shape === 'default',
        "rounded-full": shape === 'pill',
        "rounded-liquid": shape === 'liquid',
      },
      
      // Variants
      {
        "bg-white/10 border-white/20 text-foreground": variant === 'default',
        "bg-blue-500/20 border-blue-500/30 text-blue-400": variant === 'primary',
        "bg-purple-500/20 border-purple-500/30 text-purple-400": variant === 'secondary',
        "bg-green-500/20 border-green-500/30 text-green-400": variant === 'success',
        "bg-yellow-500/20 border-yellow-500/30 text-yellow-400": variant === 'warning',
        "bg-red-500/20 border-red-500/30 text-red-400": variant === 'danger',
        "bg-cyan-500/20 border-cyan-500/30 text-cyan-400": variant === 'info',
      },
      
      // Effects
      {
        "shadow-neon": glow,
        "animate-pulse": pulse,
      }
    );

    return (
      <span
        ref={ref}
        className={cn(baseClasses, className)}
        {...props}
      >
        {children}
        
        {/* Glass reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-50 pointer-events-none rounded-inherit" />
      </span>
    );
  }
);

LiquidBadge.displayName = "LiquidBadge";

import React from 'react';
import { cn } from '../utils';

interface LiquidInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'ghost';
  inputSize?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const LiquidInput = React.forwardRef<HTMLInputElement, LiquidInputProps>(
  ({ 
    className, 
    variant = 'default', 
    inputSize = 'md',
    glow = false,
    icon,
    iconPosition = 'left',
    ...props 
  }, ref) => {
    const inputClasses = cn(
      "w-full bg-transparent border-0 outline-none placeholder:text-muted-foreground/60",
      "transition-all duration-300 ease-out",
      
      // Sizes
      {
        "text-sm": inputSize === 'sm',
        "text-base": inputSize === 'md',
        "text-lg": inputSize === 'lg',
      }
    );

    const containerClasses = cn(
      "relative flex items-center transition-all duration-300 ease-out",
      "focus-within:ring-2 focus-within:ring-blue-500/30",
      
      // Variants
      {
        "liquid-glass rounded-xl border-0 focus-within:liquid-glass-strong": variant === 'default',
        "liquid-glass-strong rounded-xl border-0 focus-within:liquid-glass-tertiary": variant === 'filled',
        "bg-transparent border border-white/20 rounded-xl focus-within:border-blue-500/50 focus-within:liquid-glass": variant === 'ghost',
      },
      
      // Sizes
      {
        "h-9 px-3": inputSize === 'sm',
        "h-11 px-4": inputSize === 'md',
        "h-13 px-5": inputSize === 'lg',
      },
      
      // Effects
      {
        "shadow-neon focus-within:shadow-neon": glow,
      }
    );

    return (
      <div className={cn(containerClasses, className)}>
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="flex-shrink-0 mr-3 text-muted-foreground/60">
            {icon}
          </div>
        )}
        
        {/* Input */}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        
        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <div className="flex-shrink-0 ml-3 text-muted-foreground/60">
            {icon}
          </div>
        )}
        
        {/* Glass reflection effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    );
  }
);

LiquidInput.displayName = "LiquidInput";

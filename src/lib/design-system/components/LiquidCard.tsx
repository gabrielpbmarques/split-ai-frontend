import React from 'react';
import { cn, liquidGlassVariants } from '../utils';
import type { 
  LiquidGlassVariant, 
  LiquidGlassSize, 
  LiquidGlassRadius, 
  LiquidGlassShadow,
  LiquidGlassAnimation 
} from '../utils';

interface LiquidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LiquidGlassVariant;
  size?: LiquidGlassSize;
  radius?: LiquidGlassRadius;
  shadow?: LiquidGlassShadow;
  animation?: LiquidGlassAnimation;
  children: React.ReactNode;
}

export const LiquidCard = React.forwardRef<HTMLDivElement, LiquidCardProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    radius = 'lg', 
    shadow = 'md',
    animation,
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          liquidGlassVariants.glass[variant],
          liquidGlassVariants.size[size],
          liquidGlassVariants.radius[radius],
          liquidGlassVariants.shadow[shadow],
          animation && liquidGlassVariants.animation[animation],
          "transition-all duration-300 ease-out",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

LiquidCard.displayName = "LiquidCard";

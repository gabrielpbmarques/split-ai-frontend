import React from 'react';
import { cn } from '../utils';
import { User } from 'lucide-react';

interface LiquidAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'glass' | 'glow';
  shape?: 'circle' | 'square' | 'liquid';
  fallback?: React.ReactNode;
  online?: boolean;
}

export const LiquidAvatar = React.forwardRef<HTMLDivElement, LiquidAvatarProps>(
  ({ 
    className, 
    src, 
    alt, 
    size = 'md',
    variant = 'default',
    shape = 'circle',
    fallback,
    online,
    ...props 
  }, ref) => {
    const [imageError, setImageError] = React.useState(false);
    
    const sizeClasses = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
      '2xl': 'h-20 w-20 text-2xl',
    };
    
    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-xl',
      liquid: 'rounded-liquid',
    };
    
    const variantClasses = {
      default: 'bg-muted',
      glass: 'liquid-glass',
      glow: 'liquid-glass shadow-neon',
    };
    
    const onlineIndicatorSize = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-3.5 w-3.5',
      '2xl': 'h-4 w-4',
    };

    return (
      <div 
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden",
          "transition-all duration-300 ease-out",
          sizeClasses[size],
          shapeClasses[shape],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : fallback ? (
          fallback
        ) : (
          <User className="h-1/2 w-1/2 text-muted-foreground" />
        )}
        
        {/* Online indicator */}
        {online !== undefined && (
          <div 
            className={cn(
              "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background",
              onlineIndicatorSize[size],
              online ? 'bg-green-500' : 'bg-gray-400'
            )}
          />
        )}
        
        {/* Glass reflection effect */}
        {variant !== 'default' && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50 pointer-events-none" />
        )}
      </div>
    );
  }
);

LiquidAvatar.displayName = "LiquidAvatar";

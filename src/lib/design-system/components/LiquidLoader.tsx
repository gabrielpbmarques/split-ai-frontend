import React from 'react';
import { cn } from '../utils';

interface LiquidLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'spinner' | 'dots' | 'pulse' | 'orbital';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent';
  text?: string;
}

export const LiquidLoader = React.forwardRef<HTMLDivElement, LiquidLoaderProps>(
  ({ 
    className, 
    variant = 'spinner',
    size = 'md',
    color = 'primary',
    text,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    };
    
    const colorClasses = {
      primary: 'text-blue-500',
      secondary: 'text-purple-500',
      accent: 'text-green-500',
    };

    const SpinnerLoader = () => (
      <div className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        colorClasses[color]
      )} />
    );

    const DotsLoader = () => (
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full animate-bounce",
              size === 'sm' && 'w-1 h-1',
              size === 'md' && 'w-1.5 h-1.5',
              size === 'lg' && 'w-2 h-2',
              size === 'xl' && 'w-3 h-3',
              colorClasses[color].replace('text-', 'bg-')
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s'
            }}
          />
        ))}
      </div>
    );

    const PulseLoader = () => (
      <div className={cn(
        "rounded-full animate-pulse",
        sizeClasses[size],
        colorClasses[color].replace('text-', 'bg-'),
        "opacity-75"
      )} />
    );

    const OrbitalLoader = () => (
      <div className={cn("relative", sizeClasses[size])}>
        {/* Central core */}
        <div className={cn(
          "absolute inset-1/4 rounded-full animate-pulse",
          colorClasses[color].replace('text-', 'bg-')
        )} />
        
        {/* Orbiting elements */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-0 animate-spin"
            style={{
              animationDuration: `${2 + i * 0.5}s`,
              animationDelay: `${i * 0.2}s`
            }}
          >
            <div className={cn(
              "absolute w-1 h-1 rounded-full",
              colorClasses[color].replace('text-', 'bg-'),
              "top-0 left-1/2 -translate-x-1/2"
            )} />
          </div>
        ))}
      </div>
    );

    const renderLoader = () => {
      switch (variant) {
        case 'dots':
          return <DotsLoader />;
        case 'pulse':
          return <PulseLoader />;
        case 'orbital':
          return <OrbitalLoader />;
        default:
          return <SpinnerLoader />;
      }
    };

    return (
      <div 
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          className
        )}
        {...props}
      >
        {renderLoader()}
        
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }
);

LiquidLoader.displayName = "LiquidLoader";

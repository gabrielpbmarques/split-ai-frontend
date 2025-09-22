import React from 'react';
import { cn } from '../utils';
import { X } from 'lucide-react';
import { LiquidButton } from './LiquidButton';

interface LiquidModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export const LiquidModal: React.FC<LiquidModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalSizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Modal */}
      <div 
        className={cn(
          "relative w-full mx-4 liquid-glass-strong rounded-3xl shadow-glass-xl",
          "animate-in fade-in-0 zoom-in-95 duration-300",
          modalSizes[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            
            {showCloseButton && (
              <LiquidButton
                variant="ghost"
                size="sm"
                shape="round"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </LiquidButton>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className={cn(
          "p-6",
          (title || showCloseButton) && "pt-0"
        )}>
          {children}
        </div>
        
        {/* Glass reflection effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />
      </div>
    </div>
  );
};

LiquidModal.displayName = "LiquidModal";

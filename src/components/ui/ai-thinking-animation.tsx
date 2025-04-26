'use client';

import { useEffect, useState } from 'react';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'] });

interface AIThinkingAnimationProps {
  isThinking: boolean;
}

export function AIThinkingAnimation({ isThinking }: AIThinkingAnimationProps) {
  const [dots, setDots] = useState<string>('');
  const [pulseSpeed, setPulseSpeed] = useState<string>('animate-pulse');
  
  // Efeito para controlar a animação dos pontos
  useEffect(() => {
    if (!isThinking) {
      setDots('');
      setPulseSpeed('animate-pulse');
      return;
    }
    
    // Animação dos pontos quando está pensando
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, isThinking ? 300 : 800); // Mais rápido quando está pensando
    
    // Ajusta a velocidade da pulsação quando está pensando
    setPulseSpeed(isThinking ? 'animate-[pulse_0.8s_cubic-bezier(0.4,0,0.6,1)_infinite]' : 'animate-[pulse_2s_ease-in-out_infinite]');
    
    return () => clearInterval(interval);
  }, [isThinking]);

  return (
    <div className="flex items-center justify-center space-x-1">
      <div className={`${orbitron.className} flex items-center space-x-1`}>
        {!isThinking ? (
          <span className="text-sm font-medium text-primary">TONY AI ASSISTANT</span>
        ) : (
          <>
            <span className="text-sm font-medium text-primary">TONY</span>
            <div className="flex space-x-1">
              <div className={`h-1.5 w-1.5 rounded-full bg-primary ${pulseSpeed}`} style={{ animationDelay: '0ms' }}></div>
              <div className={`h-1.5 w-1.5 rounded-full bg-primary ${pulseSpeed}`} style={{ animationDelay: '200ms' }}></div>
              <div className={`h-1.5 w-1.5 rounded-full bg-primary ${pulseSpeed}`} style={{ animationDelay: '400ms' }}></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

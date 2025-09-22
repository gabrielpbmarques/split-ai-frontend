export const liquidGlassTokens = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  borderRadius: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    liquid: '60% 40% 30% 70% / 60% 30% 70% 40%',
  },
  
  blur: {
    sm: '10px',
    md: '20px',
    lg: '40px',
    xl: '60px',
  },
  
  opacity: {
    glass: {
      primary: 0.08,
      secondary: 0.12,
      tertiary: 0.16,
      border: 0.2,
      borderStrong: 0.3,
    },
  },
  
  shadows: {
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
    glassLg: '0 20px 40px rgba(0, 0, 0, 0.15)',
    glassXl: '0 35px 60px rgba(0, 0, 0, 0.2)',
    liquid: '0 20px 40px -4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    neon: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
    secondary: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
    accent: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)',
    mesh: 'radial-gradient(at 40% 20%, rgba(59, 130, 246, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(147, 51, 234, 0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(16, 185, 129, 0.2) 0px, transparent 50%)',
  },
  
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },
} as const;

export type LiquidGlassTokens = typeof liquidGlassTokens;

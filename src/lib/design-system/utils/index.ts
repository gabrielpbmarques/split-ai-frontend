import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const liquidGlassVariants = {
  glass: {
    primary: "liquid-glass rounded-2xl",
    secondary: "liquid-glass-strong rounded-2xl", 
    tertiary: "liquid-glass-tertiary rounded-2xl",
  },
  
  size: {
    sm: "p-3",
    md: "p-4", 
    lg: "p-6",
    xl: "p-8",
  },
  
  radius: {
    sm: "rounded-lg",
    md: "rounded-xl", 
    lg: "rounded-2xl",
    xl: "rounded-3xl",
    liquid: "rounded-liquid",
  },
  
  shadow: {
    sm: "shadow-glass",
    md: "shadow-glass-lg", 
    lg: "shadow-glass-xl",
    liquid: "shadow-liquid",
    neon: "shadow-neon",
  },
  
  animation: {
    float: "animate-float",
    shimmer: "shimmer",
    morph: "liquid-morph",
    reflect: "glass-reflect",
  },
  
  gradient: {
    primary: "liquid-gradient-primary",
    secondary: "liquid-gradient-secondary",
    accent: "liquid-gradient-accent", 
    mesh: "mesh-bg",
  },
} as const;

export type LiquidGlassVariant = keyof typeof liquidGlassVariants.glass;
export type LiquidGlassSize = keyof typeof liquidGlassVariants.size;
export type LiquidGlassRadius = keyof typeof liquidGlassVariants.radius;
export type LiquidGlassShadow = keyof typeof liquidGlassVariants.shadow;
export type LiquidGlassAnimation = keyof typeof liquidGlassVariants.animation;
export type LiquidGlassGradient = keyof typeof liquidGlassVariants.gradient;

module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
  	extend: {
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'glow-slide': 'glowSlide 3s infinite linear',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'liquid-morph': 'liquidMorph 4s ease-in-out infinite',
        'glass-reflect': 'glassReflect 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
        glowSlide: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        liquidMorph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        glassReflect: {
          '0%, 100%': { opacity: 0.1, transform: 'translateX(-100%) skewX(-15deg)' },
          '50%': { opacity: 0.3, transform: 'translateX(100%) skewX(-15deg)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        '4xl': '72px',
        '5xl': '96px',
      },
      borderRadius: {
        'lg': 'var(--radius)',
        'md': 'calc(var(--radius) - 2px)',
        'sm': 'calc(var(--radius) - 4px)',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        'liquid': '60% 40% 30% 70% / 60% 30% 70% 40%',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass-xl': '0 35px 60px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'liquid': '0 20px 40px -4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'neon': '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'liquid-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(228, 100%, 74%, 1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 1) 0px, transparent 50%)',
      },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
        glass: {
          50: 'rgba(255, 255, 255, 0.1)',
          100: 'rgba(255, 255, 255, 0.15)',
          200: 'rgba(255, 255, 255, 0.2)',
          300: 'rgba(255, 255, 255, 0.25)',
          400: 'rgba(255, 255, 255, 0.3)',
          500: 'rgba(255, 255, 255, 0.35)',
          600: 'rgba(255, 255, 255, 0.4)',
          700: 'rgba(255, 255, 255, 0.45)',
          800: 'rgba(255, 255, 255, 0.5)',
          900: 'rgba(255, 255, 255, 0.55)',
        }
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

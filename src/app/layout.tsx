// src/app/layout.tsx
import './globals.css';
import '../styles/theme.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '../components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Chat Simulador',
  description: 'Simulação de WhatsApp com IA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={`${inter.className} bg-background transition-colors duration-300`}>
        <ThemeProvider defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

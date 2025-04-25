// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Chat Simulador',
  description: 'Simulação de WhatsApp com IA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" className="dark">
      <body className={`${inter.className} bg-[#0a0a1a]`}>{children}</body>
    </html>
  );
}

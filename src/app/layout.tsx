import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AgentsProvider } from "@/contexts/AgentsContext";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Simulador de IA Suporte",
  description: "Simulador de IA para interação com agentes LLM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <AgentsProvider>
              <div className="min-h-screen bg-background mesh-bg">
                <Header />
                <main className="container mx-auto p-4 relative z-10">
                  {children}
                </main>
              </div>
            </AgentsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

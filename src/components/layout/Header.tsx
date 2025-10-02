'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LogOut, User, MessageCircle, Upload, LogIn, Bot, Menu, X, Plus, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    href: '/chat',
    label: 'Chat IA',
    icon: MessageCircle,
    requiresAuth: true
  },
  {
    href: '/agents',
    label: 'Agentes',
    icon: Bot,
    requiresAuth: true
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: FileText,
    requiresAuth: true
  },
  {
    href: '/agents/new/attendant',
    label: 'Novo Atendente',
    icon: Plus,
    requiresAuth: true
  },
  {
    href: '/upload-sources',
    label: 'Upload Fontes',
    icon: Upload,
    requiresAuth: false
  }
];

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredItems = navigationItems.filter(() => isAuthenticated);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full liquid-glass-strong border-0 transition-all duration-300">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Split AI
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="transition-transform duration-200 hover:scale-105">
              <div className="h-9 w-9"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full liquid-glass-strong border-0 transition-all duration-300">
      <div className="container max-w-full flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-6">
          {/* Logo e Título */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Split AI
            </h1>
          </div>

          {/* Navegação Integrada */}
          {isAuthenticated && filteredItems.length > 0 && (
            <nav className="hidden md:flex items-center space-x-2">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden group',
                      isActive
                        ? 'liquid-glass-strong text-foreground border border-blue-500/30 shadow-neon'
                        : 'text-muted-foreground hover:text-foreground liquid-glass hover:liquid-glass-strong hover:scale-105'
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 transition-all duration-200",
                      isActive ? "text-blue-500" : "group-hover:scale-110"
                    )} />
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg shimmer" />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Botão de Login quando não autenticado */}
          {!isAuthenticated && pathname !== '/login' && (
            <Link
              href="/login"
              className={cn(
                'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                'text-muted-foreground hover:text-foreground liquid-glass hover:liquid-glass-strong hover:scale-105'
              )}
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated && user && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground liquid-glass rounded-xl px-3 py-2 border-0 transition-all duration-200 hover:liquid-glass-strong">
              <User className="h-4 w-4" />
              <span className="font-medium hidden sm:inline">{user.email}</span>
            </div>
          )}
          
          <div className="transition-transform duration-200 hover:scale-105">
            <ThemeToggle />
          </div>
          
          {isAuthenticated && (
            <Button
              variant="liquid"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground rounded-xl transition-all duration-200 hover:scale-105"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}

          {/* Menu Mobile Button */}
          {isAuthenticated && filteredItems.length > 0 && (
            <Button
              variant="liquid"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-muted-foreground hover:text-foreground rounded-xl transition-all duration-200 hover:scale-105"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Menu Mobile */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden liquid-glass-strong border-t border-border/50">
          <nav className="container px-6 py-4">
            <div className="flex flex-col space-y-2">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden group',
                      isActive
                        ? 'liquid-glass-strong text-foreground border border-blue-500/30 shadow-neon'
                        : 'text-muted-foreground hover:text-foreground liquid-glass hover:liquid-glass-strong'
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-all duration-200",
                      isActive ? "text-blue-500" : "group-hover:scale-110"
                    )} />
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl shimmer" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

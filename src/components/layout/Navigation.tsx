'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MessageCircle, Upload, LogIn, Bot } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
    href: '/upload-sources',
    label: 'Upload Fontes',
    icon: Upload,
    requiresAuth: false
  }
];

export function Navigation() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredItems = navigationItems.filter(() => isAuthenticated);

  if (!mounted) {
    return (
      <nav className="sticky top-16 z-40 w-full liquid-glass border-0 transition-all duration-300">
        <div className="container flex h-14 items-center px-6">
          <div className="flex space-x-2"></div>
        </div>
      </nav>
    );
  }

  if (!isAuthenticated && pathname !== '/login') {
    return (
      <nav className="sticky top-16 z-40 w-full liquid-glass border-0 transition-all duration-300">
        <div className="container flex h-14 items-center px-6">
          <Link
            href="/login"
            className={cn(
              'flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
              'text-muted-foreground hover:text-foreground liquid-glass hover:liquid-glass-strong hover:scale-105 hover:shadow-lg'
            )}
          >
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </Link>
        </div>
      </nav>
    );
  }

  if (filteredItems.length === 0) return null;

  return (
    <nav className="sticky top-16 z-40 w-full liquid-glass border-0 transition-all duration-300">
      <div className="container flex h-14 items-center px-6">
        <div className="flex space-x-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden group',
                  isActive
                    ? 'liquid-glass-strong text-foreground border border-blue-500/30 shadow-neon'
                    : 'text-muted-foreground hover:text-foreground liquid-glass hover:liquid-glass-strong hover:scale-105 hover:shadow-lg'
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 transition-all duration-200",
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
      </div>
    </nav>
  );
}


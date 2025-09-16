'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MessageCircle, Upload, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navigationItems = [
  {
    href: '/chat',
    label: 'Chat IA',
    icon: MessageCircle,
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
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const filteredItems = navigationItems.filter(() => isAuthenticated);

  if (!isAuthenticated && pathname !== '/login') {
    return (
      <nav className="border-b bg-background">
        <div className="container flex h-12 items-center px-4">
          <Link
            href="/login"
            className={cn(
              'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md',
              'text-muted-foreground hover:text-foreground hover:bg-accent'
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
    <nav className="border-b bg-background">
      <div className="container flex h-12 items-center px-4">
        <div className="flex space-x-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

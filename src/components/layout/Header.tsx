'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full liquid-glass-strong border-0 transition-all duration-300">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Support AI Simulator
            </h1>
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
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Support AI Simulator
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated && user && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground liquid-glass rounded-xl px-3 py-2 border-0 transition-all duration-200 hover:liquid-glass-strong">
              <User className="h-4 w-4" />
              <span className="font-medium">{user.email}</span>
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
        </div>
      </div>
    </header>
  );
}

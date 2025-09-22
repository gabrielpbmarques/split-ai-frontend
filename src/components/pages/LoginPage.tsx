"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loading } from "@/components/ui/Loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, AlertCircle } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.login(email, password);
      login(response.data.token, response.data.user);
      router.push("/chat");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full">
      <div
        className="w-screen"
        style={{
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
        }}
      >
        <div className="relative min-h-[calc(100vh-120px)] overflow-hidden mesh-bg">
          <div className="relative z-10 container mx-auto flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-6">
            <Card variant="liquid" className="w-full max-w-lg glass-reflect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">AI</span>
                  </div>
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Login
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground"
                    >
                      Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors duration-200" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-14 text-base rounded-2xl liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-foreground"
                    >
                      Senha
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors duration-200" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 h-14 text-base rounded-2xl liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="liquid-primary"
                      className="w-full rounded-2xl h-14 text-base font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loading size="sm" />
                          <span>Entrando...</span>
                        </div>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

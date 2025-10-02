"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Bot, User, AlertCircle, RefreshCcw } from "lucide-react";
import { ChatMessage } from "@/types";
import OrbitalLoader from "@/components/ui/orbital-loader";
import { AgentSelector } from "@/components/ui/agent-selector";

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isAttendantAgent, setIsAttendantAgent] = useState(false);

  const { token, isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewSession = async () => {
    if (!token || !isAuthenticated || !selectedAgentId) return;
    setIsCreatingSession(true);
    setError("");
    try {
      await apiService.createSession(selectedAgentId, token);
      setMessages([]);
    } catch (err: any) {
      setError(err.message || "Erro ao criar nova sessão");
    } finally {
      setIsCreatingSession(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    async function loadAgentDetails() {
      if (!token || !isAuthenticated || !selectedAgentId) {
        setIsAttendantAgent(false);
        return;
      }
      try {
        const details = await apiService.getAgent(selectedAgentId, token);
        if (!cancelled) {
          const parserName = details?.parser?.name || null;
          setIsAttendantAgent(parserName === 'attendantParserFormatter');
        }
      } catch {
        if (!cancelled) setIsAttendantAgent(false);
      }
    }
    loadAgentDetails();
    return () => {
      cancelled = true;
    };
  }, [selectedAgentId, token, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !token || !isAuthenticated || !selectedAgentId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError("");

    // Criar mensagem da IA que será preenchida progressivamente
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: "",
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);

    try {
      abortControllerRef.current = new AbortController();

      if (isAttendantAgent) {
        const fullText = await apiService.askAttendant(
          userMessage.content,
          selectedAgentId,
          token,
          abortControllerRef.current.signal,
        );
        setMessages((prev) =>
          prev.map((msg) => (msg.id === aiMessage.id ? { ...msg, content: fullText } : msg))
        );
      } else {
        const stream = await apiService.askQuestion(
          userMessage.content,
          selectedAgentId,
          token,
          abortControllerRef.current.signal,
        );

        if (!stream) {
          throw new Error("Não foi possível obter resposta do servidor");
        }

        const reader = stream.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessage.id
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }

        const flush = decoder.decode();
        if (flush) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessage.id
                ? { ...msg, content: msg.content + flush }
                : msg
            )
          );
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;

      setError(err.message || "Erro ao enviar mensagem");
      setMessages((prev) => prev.filter((msg) => msg.id !== aiMessage.id));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Alert className="max-w-md bg-white/5 backdrop-blur-xl border-white/10 dark:border-white/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você precisa estar logado para usar o chat.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-152px)] p-6">
      <Card variant="liquid" className="flex flex-col h-full glass-reflect">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Chat com IA
            </span>
          </CardTitle>
          
          <div className="flex items-center gap-3">
            <AgentSelector
              selectedAgentId={selectedAgentId}
              onAgentChange={setSelectedAgentId}
              className="min-w-[280px] cursor-pointer"
            />
            <Button
              type="button"
              onClick={handleNewSession}
              disabled={!selectedAgentId || isLoading || isCreatingSession}
              variant="liquid"
              className="rounded-2xl px-4"
           >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Nova sessão
            </Button>
          </div>
        </CardHeader>

        <CardContent className="relative flex flex-col flex-1 space-y-4 min-h-0">
          <div className="absolute inset-0 z-0 flex items-center justify-center text-muted-foreground pointer-events-none">
            <div className="text-center">
              <div className="mb-6">
                <OrbitalLoader isThinking={isLoading} />
              </div>
              {messages.length === 0 && (
                <>
                  <p className="text-lg font-medium">
                    {selectedAgentId ? "Inicie uma conversa com a IA" : "Selecione um agente para começar"}
                  </p>
                  <p className="text-sm opacity-70 mt-2">
                    {selectedAgentId 
                      ? "Digite sua mensagem abaixo para começar" 
                      : "Escolha um agente no seletor acima"
                    }
                  </p>
                </>
              )}
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="flex-shrink-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="relative z-10 flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.isUser ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                      message.isUser
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                        : "liquid-glass border-0"
                    }`}
                  >
                    {message.isUser ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl ${
                      message.isUser
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                        : "liquid-glass-strong border-0 text-foreground"
                    }`}
                  >
                    {!message.isUser && message.content === "" && isLoading ? (
                      <div className="flex items-center space-x-3 py-2">
                        <span className="text-sm text-muted-foreground animate-pulse">
                          IA está pensando...
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                        <p className="text-xs opacity-70 mt-2 font-medium">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex space-x-3 flex-shrink-0"
          >
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="rounded-2xl liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            {isLoading ? (
              <Button
                type="button"
                onClick={stopGeneration}
                variant="destructive"
                className="rounded-2xl px-6 transition-all duration-200 hover:scale-105"
              >
                Parar
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!inputValue.trim() || !selectedAgentId}
                variant="liquid-primary"
                className="rounded-2xl px-6 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

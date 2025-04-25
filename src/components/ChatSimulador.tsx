'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Orbitron } from 'next/font/google';
import { uploadImageToImgBB } from '@/lib/imageUpload';

// Add Orbitron font for space-themed headings
const orbitron = Orbitron({ subsets: ['latin'] });

export default function ChatSimulador() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isChatReady, setIsChatReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Get API URL from environment variable
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const handlePhoneNumberChange = (e) => {
    // Only allow digits in the phone number
    const value = e.target.value.replace(/\D/g, '');
    setPhoneNumber(value);
  };

  const startChat = () => {
    // Basic validation - could be enhanced
    if (phoneNumber.length >= 10) {
      setIsChatReady(true);
    } else {
      alert('Por favor, digite um número de telefone válido');
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Converter a imagem do canvas para um data URL (formato base64)
      // Usando qualidade 0.7 para JPEG para equilibrar qualidade e tamanho
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      setMediaUrl(dataUrl);
      
      // Parar a câmera
      video.srcObject.getTracks().forEach((track) => track.stop());
      setShowCamera(false);
      setShowImagePreview(true);
    }
  };
  
  const cancelImagePreview = () => {
    setMediaUrl('');
    setShowImagePreview(false);
  };
  
  const sendImageMessage = async () => {
    if (!mediaUrl) return;
    
    const userMessage = {
      sender: 'user',
      text: '[imagem enviada]',
      image: mediaUrl
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setShowImagePreview(false);
    setLoading(true);
    
    try {
      // Mostrar mensagem de upload
      setMessages((prev) => [...prev, { 
        sender: 'bot', 
        text: 'Fazendo upload da imagem...' 
      }]);
      
      // Fazer upload da imagem para o ImgBB
      const uploadResult = await uploadImageToImgBB(mediaUrl);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Falha ao fazer upload da imagem');
      }
      
      // Atualizar a mensagem de status
      setMessages((prev) => {
        const newMessages = [...prev];
        // Substituir a última mensagem (que era a de upload)
        newMessages[newMessages.length - 1] = {
          sender: 'bot',
          text: 'Upload concluído! Enviando para processamento...',
        };
        return newMessages;
      });
      
      // Usar a URL retornada pelo ImgBB
      const imageUrl = uploadResult.display_url || uploadResult.url;
      
      // Enviar a URL da imagem para a API
      const response = await fetch(`${apiUrl}/whatsapp/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          message: '',
          sessionId: sessionId || undefined,
          mediaUrl: imageUrl, // Usar a URL do ImgBB em vez do base64
        }),
      });

      const data = await response.json();
      if (data.sessionId && !sessionId) setSessionId(data.sessionId);
      const botMessage = {
        sender: 'bot',
        text: data.message || '[Sem resposta da IA]',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      
      // Atualizar a mensagem de status ou adicionar nova mensagem de erro
      setMessages((prev) => {
        const newMessages = [...prev];
        // Se a última mensagem for do bot (mensagem de status), substituir
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].sender === 'bot') {
          newMessages[newMessages.length - 1] = {
            sender: 'bot',
            text: `Erro: ${error.message || 'Falha ao processar a imagem'}`
          };
        } else {
          // Caso contrário, adicionar nova mensagem
          newMessages.push({
            sender: 'bot',
            text: `Erro: ${error.message || 'Falha ao processar a imagem'}`
          });
        }
        return newMessages;
      });
    } finally {
      setMediaUrl('');
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: 'user',
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/whatsapp/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          message: input,
          sessionId: sessionId || undefined,
        }),
      });

      const data = await response.json();
      if (data.sessionId && !sessionId) setSessionId(data.sessionId);
      const botMessage = {
        sender: 'bot',
        text: data.message || '[Sem resposta da IA]',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Erro ao conectar com a API.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Com Shift+Enter, permite a quebra de linha (não faz nada)
        return;
      }
      // Com Enter sozinho, envia a mensagem
      e.preventDefault(); // Impede quebra de linha
      sendMessage();
    }
  };
  
  // Phone number input screen
  if (!isChatReady) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a1a] to-[#0a0a1a] flex flex-col items-center justify-center p-4">
        <div className="mb-6 text-center">
          <h1 className={`${orbitron.className} text-4xl font-bold text-primary mb-1 tracking-wider`}>TONY <span className="text-white/80 text-2xl">2.0</span></h1>
          <div className="h-0.5 w-48 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto animate-pulse-glow relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/70 to-transparent animate-glow-slide"></div>
          </div>
        </div>
        <Card className="max-w-md w-full mx-auto backdrop-blur-sm bg-card/50 border border-primary/20 shadow-lg shadow-primary/10 h-[700px] flex flex-col">
          <CardContent className="flex flex-col items-center justify-center h-full gap-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-white">Simulador de Chat</h2>
              <p className="text-sm text-muted-foreground text-center">
                Digite o número de telefone para iniciar a conversa
              </p>
            </div>
            <div className="relative w-full max-w-[80%]">
              <Input
                placeholder="Digite o número (apenas dígitos)"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="bg-background/50 backdrop-blur-sm border-primary/30 focus:border-primary/70"
                onKeyPress={(e) => e.key === 'Enter' && startChat()}
              />
            </div>
            <Button 
              onClick={startChat} 
              className="bg-primary hover:bg-primary/80 text-white font-medium px-6">
              Iniciar Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading animation component
  const LoadingAnimation = () => (
    <div className="flex items-center justify-center space-x-1">
      <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a1a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a1a] to-[#0a0a1a] flex flex-col items-center justify-center p-4">
      <div className="mb-6 text-center">
        <h1 className={`${orbitron.className} text-4xl font-bold text-primary mb-1 tracking-wider`}>TONY <span className="text-white/80 text-2xl">2.0</span></h1>
        <div className="h-0.5 w-48 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto animate-pulse-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/70 to-transparent animate-glow-slide"></div>
        </div>
      </div>
      <Card className="max-w-md w-full mx-auto backdrop-blur-sm bg-card/50 border border-primary/20 shadow-lg shadow-primary/10 h-[700px] flex flex-col">
        <div className="p-3 border-b border-border/50 bg-muted/20 backdrop-blur-sm rounded-t-md flex items-center justify-center">
          <h3 className={`${orbitron.className} text-sm font-medium text-primary`}>TONY AI ASSISTANT</h3>
        </div>
        <CardContent className="flex-1 overflow-y-auto space-y-3 p-4 bg-gradient-to-b from-background/80 to-background rounded scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`relative text-sm p-3 rounded-lg max-w-[80%] whitespace-pre-wrap break-words ${msg.sender === 'user'
                ? 'bg-primary/20 border border-primary/30 text-foreground self-end ml-auto rounded-br-none'
                : 'bg-secondary/20 border border-secondary/30 text-foreground self-start mr-auto rounded-bl-none'
              }`}
            >
              {msg.image ? (
                <div className="space-y-2">
                  <img src={msg.image} alt="Imagem enviada" className="max-w-full h-auto rounded" style={{ maxHeight: '200px' }} />
                  <div className="text-xs text-muted-foreground">{msg.text}</div>
                </div>
              ) : (
                msg.text
              )}
            </div>
          ))}
          {loading && (
            <div className="bg-secondary/20 border border-secondary/30 text-foreground self-start mr-auto rounded-lg rounded-bl-none p-3 max-w-[80%]">
              <LoadingAnimation />
            </div>
          )}
        </CardContent>

        {showCamera && (
          <div className="flex flex-col items-center gap-2 p-2 border-t border-border/50 bg-muted/20">
            <video ref={videoRef} autoPlay className="w-full rounded-md" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-2 w-full justify-center">
              <Button 
                onClick={() => setShowCamera(false)} 
                variant="outline" 
                className="border-destructive/30 hover:bg-destructive/20 text-destructive-foreground">
                Cancelar
              </Button>
              <Button onClick={captureImage} className="bg-primary hover:bg-primary/80">Capturar</Button>
            </div>
          </div>
        )}
        
        {showImagePreview && mediaUrl && (
          <div className="flex flex-col items-center gap-2 p-2 border-t border-border/50 bg-muted/20">
            <div className="relative w-full">
              <img src={mediaUrl} alt="Preview" className="w-full rounded-md" style={{ maxHeight: '300px', objectFit: 'contain' }} />
            </div>
            <div className="flex gap-2 w-full justify-center">
              <Button 
                onClick={cancelImagePreview} 
                variant="outline" 
                className="border-destructive/30 hover:bg-destructive/20 text-destructive-foreground">
                Cancelar
              </Button>
              <Button onClick={sendImageMessage} className="bg-primary hover:bg-primary/80">Enviar</Button>
            </div>
          </div>
        )}

        <div className="flex items-center p-3 border-t border-border/50 bg-muted/20 backdrop-blur-sm gap-2 rounded-b-md">
          <textarea
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            rows={1}
            style={{ resize: 'none', minHeight: '40px', maxHeight: '120px', overflow: 'auto' }}
            className="flex w-full rounded-md border border-input bg-background/50 backdrop-blur-sm border-primary/30 focus:border-primary/70 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button 
            onClick={sendMessage} 
            disabled={loading}
            className="bg-primary hover:bg-primary/80 text-white">
            Enviar
          </Button>
          <Button 
            onClick={startCamera} 
            variant="outline" 
            className="border-primary/30 hover:bg-primary/20">
            📷
          </Button>
        </div>
      </Card>
    </div>
  );
}

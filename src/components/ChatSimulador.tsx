'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Orbitron } from 'next/font/google';
import { uploadImageToImgBB } from '@/lib/imageUpload';
import LinkifyText from '@/components/ui/LinkifyText';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import OrbitalLoader from './ui/orbital-loader';

// Estilos para esconder as barras de rolagem mas manter a funcionalidade
const hideScrollbarStyle = {
  scrollbarWidth: 'none', // Firefox
  msOverflowStyle: 'none', // IE/Edge
};

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
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const dropZoneRef = useRef(null);

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
    setIsAIThinking(true); // Ativa a animação de pensamento

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
      setIsAIThinking(false); // Desativa a animação de pensamento
    }
  };

  // Function to remove JSON blocks from the AI response
  const removeJsonBlocks = (text) => {
    if (!text) return text;

    // First try to handle the specific format from the example
    // This matches the exact pattern we've seen in the example
    const specificJsonPattern = /```json\s*\{[\s\S]*?\}\s*```|\{\s*"invalid_fields"[\s\S]*?"status":\s*"[^"]*"\s*\}/g;

    // Apply the specific pattern first
    let cleanedText = text.replace(specificJsonPattern, '');

    // If that didn't change anything, try more general approaches
    if (cleanedText === text) {
      // Regular expression to match JSON blocks in code fences
      const jsonCodeBlockRegex = /```json\s*([\s\S]*?)\s*```/g;

      // Regular expression to match standalone JSON objects
      // This is a more general pattern that looks for balanced braces
      const standaloneJsonRegex = /\{(?:[^{}]|\{[^{}]*\})*\}/g;

      // First remove JSON blocks in code fences
      cleanedText = text.replace(jsonCodeBlockRegex, '');

      // Then try to identify and remove standalone JSON objects
      // But only if they look like our metadata format
      cleanedText = cleanedText.replace(standaloneJsonRegex, (match) => {
        // Only remove if it looks like our metadata
        if (match.includes('"invalid_fields"') ||
          match.includes('"fieldstoupdate"') ||
          match.includes('"registrationstage"') ||
          match.includes('"status"')) {
          return '';
        }
        return match; // Keep other JSON-like structures
      });
    }

    // Clean up any extra whitespace and return
    return cleanedText.trim();
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
    setIsAIThinking(true); // Ativa a animação de pensamento

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

      // Clean the message by removing any JSON blocks
      const cleanedMessage = removeJsonBlocks(data.message || '[Sem resposta da IA]');

      const botMessage = {
        sender: 'bot',
        text: cleanedMessage,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Erro ao conectar com a API.' }]);
    } finally {
      setLoading(false);
      setIsAIThinking(false); // Desativa a animação de pensamento
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

  // Função para processar imagens arrastadas e soltas
  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Verificar se o arquivo é uma imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, arraste apenas arquivos de imagem.');
        return;
      }
      
      // Limite de tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande. O tamanho máximo é 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMediaUrl(event.target.result.toString());
          setShowImagePreview(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Phone number input screen
  if (!isChatReady) {
    return (
      <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
        {/* Botão de tema no canto superior direito */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="mb-6 md:mb-10 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center mb-1" style={{ transform: 'scale(1.2)', margin: '0 auto' }}>
            <OrbitalLoader isThinking={false} />
          </div>
        </div>
        <Card style={{ display: 'flex', justifyContent: 'center' }} className="w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto backdrop-blur-sm bg-card border border-primary/20 shadow-lg shadow-primary/10 max-h-[90vh] min-h-[500px] flex flex-col">
          <CardContent className="flex flex-col items-center justify-center h-full gap-8 py-12">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-foreground">Simulador de Chat</h2>
              <p className="text-sm text-muted-foreground text-center">
                Digite o número de telefone para iniciar a conversa
              </p>
            </div>
            <div className="relative w-full max-w-[80%] md:max-w-[60%]">
              <Input
                placeholder="Digite o número (apenas dígitos)"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="bg-background/50 backdrop-blur-sm border-primary/30 focus:border-primary/70 md:py-6 md:text-lg"
                onKeyPress={(e) => e.key === 'Enter' && startChat()}
              />
            </div>
            <Button
              onClick={startChat}
              className="bg-primary hover:bg-primary/80 text-white font-medium px-6 py-2 md:py-3 md:text-lg">
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
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Botão de tema no canto superior direito */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="mb-6 md:mb-10 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center mb-1" style={{ transform: 'scale(1.2)', margin: '0 auto' }}>
          <OrbitalLoader isThinking={isAIThinking} />
        </div>
      </div>
      <Card className="w-full max-w-md md:max-w-xl lg:max-w-3xl xl:max-w-4xl mx-auto border border-primary/30 shadow-lg shadow-primary/10 overflow-hidden bg-card h-[600px] md:h-[700px] lg:h-[750px] flex flex-col">
        <div className="p-3 md:p-4 border-b border-border/50 bg-muted/20 backdrop-blur-sm rounded-t-md flex items-center justify-between">
          <div className="w-8"></div> {/* Espaço vazio para equilibrar o layout */}
          <h3 className={`${orbitron.className} text-sm md:text-base font-medium text-primary tracking-wider`}>ASSISTENTE IA</h3>
          <ThemeToggle />
        </div>
        <CardContent 
          ref={dropZoneRef}
          className={`flex flex-col gap-2 p-3 md:p-5 flex-grow overflow-y-auto ${isDragging ? 'bg-primary/10 border-2 border-dashed border-primary/50' : ''}`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            flex: '1 1 auto',
            height: '0px', // Isso força o container a não crescer além do flex
            transition: 'background-color 0.2s, border 0.2s'
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleImageDrop}
        >
          <style jsx global>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
              width: 0;
              background: transparent;
            }
          `}</style>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`relative text-sm md:text-base p-3 md:p-4 rounded-lg max-w-[80%] md:max-w-[75%] whitespace-pre-wrap break-words ${msg.sender === 'user'
                ? 'bg-primary/20 border border-primary/30 text-foreground self-end ml-auto rounded-br-none'
                : 'bg-muted border border-secondary/50 text-foreground self-start mr-auto rounded-bl-none dark:bg-secondary/20'
                }`}
            >
              {msg.image ? (
                <div className="space-y-2">
                  <img src={msg.image} alt="Imagem enviada" className="max-w-full h-auto rounded" style={{ maxHeight: '200px', maxWidth: '100%' }} />
                  <div className="text-xs text-muted-foreground">{msg.text}</div>
                </div>
              ) : (
                <LinkifyText text={msg.text} />
              )}
            </div>
          ))}
          {loading && (
            <div className="bg-secondary/20 border border-secondary/30 text-foreground self-start mr-auto rounded-lg rounded-bl-none p-3 md:p-4 max-w-[80%] md:max-w-[75%]">
              <LoadingAnimation />
            </div>
          )}
        </CardContent>

        {showCamera && (
          <div className="flex flex-col items-center gap-2 p-2 border-t border-border/50 bg-muted/20 max-h-[40vh]">
            <div className="w-full h-full overflow-hidden flex items-center justify-center">
              <video ref={videoRef} autoPlay className="w-full max-h-[30vh] object-contain rounded-md" />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-2 w-full justify-center">
              <Button
                onClick={() => setShowCamera(false)}
                variant="outline"
                className="border-destructive/50 hover:bg-destructive/20 text-destructive dark:text-destructive-foreground">
                Cancelar
              </Button>
              <Button onClick={captureImage} className="bg-primary hover:bg-primary/80">Capturar</Button>
            </div>
          </div>
        )}

        {showImagePreview && mediaUrl && (
          <div className="flex flex-col items-center gap-2 p-2 border-t border-border/50 bg-muted/20 max-h-[40vh]">
            <div className="w-full h-full overflow-hidden flex items-center justify-center">
              <img src={mediaUrl} alt="Preview" className="rounded-md max-h-[30vh]" style={{ maxWidth: '100%', objectFit: 'contain' }} />
            </div>
            <div className="flex gap-2 w-full justify-center">
              <Button
                onClick={cancelImagePreview}
                variant="outline"
                className="border-destructive/50 hover:bg-destructive/20 text-destructive dark:text-destructive-foreground">
                Cancelar
              </Button>
              <Button onClick={sendImageMessage} className="bg-primary hover:bg-primary/80">Enviar</Button>
            </div>
          </div>
        )}

        <div className="flex items-center p-3 md:p-5 border-t border-border/50 bg-muted/20 backdrop-blur-sm gap-2 md:gap-3 rounded-b-md">
          <textarea
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            rows={1}
            style={{
              resize: 'none',
              minHeight: '45px',
              maxHeight: '80px',
              overflow: 'auto',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE/Edge
            }}
            className="flex w-full rounded-md border border-input bg-background/50 backdrop-blur-sm border-primary/30 focus:border-primary/70 px-3 py-2 text-sm md:text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hide-scrollbar"
          />
          <Button
            onClick={sendMessage}
            disabled={loading}
            className="bg-primary hover:bg-primary/80 text-white whitespace-nowrap md:px-6 md:py-5 md:text-base">
            Enviar
          </Button>
          <Button
            onClick={startCamera}
            variant="outline"
            className="border-primary/30 hover:bg-primary/20 md:px-4 md:py-5 md:text-base">
            📷
          </Button>
        </div>
      </Card>
    </div>
  );
}

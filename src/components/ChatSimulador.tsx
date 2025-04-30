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

// Orbitron font para títulos com estilo espacial
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
  const messagesEndRef = useRef(null);

  // Get API URL from environment variable
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // Scroll para o final da conversa quando novas mensagens são adicionadas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Configurar event listeners para drag and drop
  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleImageDrop(e);
    };

    if (dropZoneRef.current) {
      const dropZone = dropZoneRef.current;
      dropZone.addEventListener('dragover', handleDragOver);
      dropZone.addEventListener('dragleave', handleDragLeave);
      dropZone.addEventListener('drop', handleDrop);

      return () => {
        dropZone.removeEventListener('dragover', handleDragOver);
        dropZone.removeEventListener('dragleave', handleDragLeave);
        dropZone.removeEventListener('drop', handleDrop);
      };
    }
  }, [dropZoneRef.current]);

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
          text: 'Processando sua imagem...'
        };
        return newMessages;
      });

      // Enviar a URL da imagem para a API
      const response = await fetch(`${apiUrl}/whatsapp/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: '[IMAGEM]',
          sessionId: sessionId || null,
          phoneNumber,
          mediaUrl: uploadResult.url
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Atualizar o sessionId se for a primeira mensagem
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Remover a mensagem de status e adicionar a resposta da API
      setMessages((prev) => {
        const newMessages = [...prev];
        // Remover a última mensagem (que era a de processamento)
        newMessages.pop();
        
        // Adicionar a resposta da API
        newMessages.push({
          sender: 'bot',
          text: data.message || 'Não foi possível processar sua imagem.'
        });
        return newMessages;
      });
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      
      // Atualizar a mensagem de erro
      setMessages((prev) => {
        const newMessages = [...prev];
        // Substituir a última mensagem com o erro
        newMessages[newMessages.length - 1] = {
          sender: 'bot',
          text: `Erro ao processar imagem: ${error.message}`
        };
        return newMessages;
      });
    } finally {
      setLoading(false);
      setIsAIThinking(false);
      setMediaUrl('');
    }
  };

  // Function to remove JSON blocks from the AI response
  const removeJsonBlocks = (text) => {
    if (!text) return '';

    // Detect and remove JSON blocks in various formats
    // Format 1: ```json ... ```
    let processedText = text.replace(/```json([\s\S]*?)```/g, '');
    
    // Format 2: ```javascript ... ```
    processedText = processedText.replace(/```javascript([\s\S]*?)```/g, '');
    
    // Format 3: ```js ... ```
    processedText = processedText.replace(/```js([\s\S]*?)```/g, '');
    
    // Format 4: ``` ... ``` (any code block)
    processedText = processedText.replace(/```([\s\S]*?)```/g, '');
    
    // Format 5: {{{ ... }}} (custom format sometimes used)
    processedText = processedText.replace(/{{{([\s\S]*?)}}}/g, '');
    
    // Format 6: { ... } (only if it looks like a complete JSON object)
    // This is more complex as we don't want to remove all curly braces
    // We'll look for patterns that suggest a JSON object
    processedText = processedText.replace(/\{[\s\n]*"[^"]+"\s*:[\s\S]*?\}/g, '');
    
    // Trim whitespace and remove any empty lines that might have been left
    processedText = processedText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
    
    return processedText;
  };

  const sendMessage = async () => {
    if (!input.trim() && !mediaUrl) return;

    // Adicionar a mensagem do usuário à conversa
    const userMessage = {
      sender: 'user',
      text: input
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsAIThinking(true); // Ativa a animação de pensamento

    try {
      // Enviar a mensagem para a API
      const response = await fetch(`${apiUrl}/whatsapp/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId || null,
          phoneNumber
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Atualizar o sessionId se for a primeira mensagem
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Processar a resposta para remover blocos JSON
      const cleanResponse = removeJsonBlocks(data.message);

      // Adicionar a resposta da API à conversa
      setMessages((prev) => [...prev, {
        sender: 'bot',
        text: cleanResponse || 'Desculpe, não entendi sua mensagem.'
      }]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages((prev) => [...prev, {
        sender: 'bot',
        text: `Erro: ${error.message}`
      }]);
    } finally {
      setLoading(false);
      setIsAIThinking(false);
    }
  };

  const handleKeyPress = (e) => {
    // Enviar mensagem ao pressionar Enter (sem Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Função para processar imagens arrastadas e soltas
  const handleImageDrop = (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Verificar se o arquivo é uma imagem
      if (!file.type.match('image.*')) {
        alert('Por favor, envie apenas arquivos de imagem.');
        return;
      }
      
      // Verificar o tamanho do arquivo (limite de 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo é muito grande. Por favor, envie imagens de até 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        // Comprimir a imagem antes de enviar
        const img = new Image();
        img.src = event.target.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Redimensionar se necessário (máximo 1200px de largura/altura)
          let width = img.width;
          let height = img.height;
          
          if (width > 1200 || height > 1200) {
            if (width > height) {
              height = Math.round((height * 1200) / width);
              width = 1200;
            } else {
              width = Math.round((width * 1200) / height);
              height = 1200;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Converter para JPEG com qualidade 0.7
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setMediaUrl(dataUrl);
          setShowImagePreview(true);
        };
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Loading animation component
  const LoadingAnimation = () => (
    <div className="flex items-center justify-center space-x-1">
      <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
    </div>
  );

  // Tela de entrada do número de telefone
  if (!isChatReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative">
        {/* Gradiente de fundo sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 z-0"></div>
        
        {/* Botão de tema no canto superior direito */}
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        
        <Card className="w-full max-w-md p-6 shadow-lg border border-border/30 backdrop-blur-sm bg-card/90 glass card-depth z-10">
          <CardContent className="flex flex-col gap-6 pt-6">
            <div className="text-center space-y-2">
              <h2 className={`text-2xl font-bold text-gradient gradient-primary ${orbitron.className}`}>
                Chat Simulador
              </h2>
              <p className="text-muted-foreground text-sm">
                Uma experiência de conversa interativa
              </p>
            </div>
            
            {/* Animação orbital centralizada */}
            <div className="flex justify-center py-4">
              <div style={{ transform: 'scale(0.8)' }}>
                <OrbitalLoader isThinking={false} />
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Digite seu número de telefone:
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="border-primary/30 focus:border-primary/70 bg-background/50 backdrop-blur-sm shadow-sm"
                onKeyDown={(e) => e.key === 'Enter' && startChat()}
              />
            </div>
            
            <Button 
              onClick={startChat} 
              className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg py-6 text-base font-medium btn-enhanced">
              Iniciar Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interface principal do chat
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative" ref={dropZoneRef}>
      {/* Gradiente de fundo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 z-0"></div>
      
      {/* Indicador de drag and drop */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center z-50 border-2 border-dashed border-primary/50 rounded-lg">
          <div className="text-center p-4 bg-card/80 rounded-lg shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-primary mb-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p className="text-foreground font-medium">Solte a imagem para enviá-la</p>
          </div>
        </div>
      )}
      
      {/* Botão de tema no canto superior direito */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      {/* Animação orbital no topo */}
      <div className="mb-4 flex items-center justify-center">
        <div style={{ transform: 'scale(0.8)' }}>
          <OrbitalLoader isThinking={isAIThinking} />
        </div>
      </div>
      
      <Card className="w-full max-w-2xl shadow-lg relative overflow-hidden border border-border/40 backdrop-blur-sm bg-card/95 glass z-10">
        <div className="p-3 md:p-4 border-b border-border/50 bg-muted/20 backdrop-blur-sm rounded-t-md flex items-center justify-between">
          <div className="w-8"></div> {/* Espaço vazio para equilibrar o layout */}
          <h3 className={`${orbitron.className} text-sm md:text-base font-medium text-gradient gradient-primary tracking-wider`}>ASSISTENTE IA</h3>
          <div className="w-8 h-8 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${isAIThinking ? 'bg-primary animate-pulse-subtle' : 'bg-green-500'}`}></div>
          </div>
        </div>
        
        <CardContent className="p-0 flex flex-col gap-0 overflow-hidden" style={{ height: '600px' }}>
          <div
            className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 md:gap-5 hide-scrollbar"
            ref={messagesEndRef}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${msg.sender === 'user' ? 'self-end ml-auto' : 'self-start mr-auto'} 
                           ${msg.sender === 'user' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/10 border border-secondary/20 text-foreground shadow-sm'} 
                           rounded-lg ${msg.sender === 'user' ? 'rounded-br-none' : 'rounded-bl-none'} 
                           p-3 md:p-4 max-w-[80%] md:max-w-[75%] transition-all`}
              >
                {msg.image ? (
                  <div className="flex flex-col gap-2">
                    <img src={msg.image} alt="Imagem enviada" className="max-w-full h-auto rounded-md shadow-sm" style={{ maxHeight: '200px', maxWidth: '100%' }} />
                    <div className="text-xs text-muted-foreground">{msg.text}</div>
                  </div>
                ) : (
                  <LinkifyText text={msg.text} />
                )}
              </div>
            ))}
            
            {loading && (
              <div className="bg-secondary/10 border border-secondary/20 text-foreground self-start mr-auto rounded-lg rounded-bl-none p-3 md:p-4 max-w-[80%] md:max-w-[75%] shadow-sm">
                <LoadingAnimation />
              </div>
            )}
          </div>

          {showCamera && (
            <div className="flex flex-col items-center gap-3 p-4 border-t border-border/50 bg-muted/10 backdrop-blur-sm max-h-[40vh]">
              <div className="w-full h-full overflow-hidden flex items-center justify-center rounded-lg shadow-md">
                <video ref={videoRef} autoPlay className="w-full max-h-[30vh] object-contain rounded-lg" />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-3 w-full justify-center">
                <Button
                  onClick={() => setShowCamera(false)}
                  variant="outline"
                  className="border-destructive/50 hover:bg-destructive/20 text-destructive dark:text-destructive-foreground shadow-sm transition-all">
                  Cancelar
                </Button>
                <Button 
                  onClick={captureImage} 
                  className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">
                  Capturar
                </Button>
              </div>
            </div>
          )}

          {showImagePreview && mediaUrl && (
            <div className="flex flex-col items-center gap-3 p-4 border-t border-border/50 bg-muted/10 backdrop-blur-sm max-h-[40vh]">
              <div className="w-full h-full overflow-hidden flex items-center justify-center rounded-lg shadow-md">
                <img src={mediaUrl} alt="Preview" className="rounded-lg max-h-[30vh]" style={{ maxWidth: '100%', objectFit: 'contain' }} />
              </div>
              <div className="flex gap-3 w-full justify-center">
                <Button
                  onClick={cancelImagePreview}
                  variant="outline"
                  className="border-destructive/50 hover:bg-destructive/20 text-destructive dark:text-destructive-foreground shadow-sm transition-all">
                  Cancelar
                </Button>
                <Button 
                  onClick={sendImageMessage} 
                  className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">
                  Enviar
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center p-4 md:p-6 border-t border-border/50 bg-muted/10 backdrop-blur-sm gap-3 md:gap-4 rounded-b-md">
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
                overflow: 'auto'
              }}
              className="flex w-full rounded-lg border border-input bg-background/50 backdrop-blur-sm border-primary/30 focus:border-primary/70 px-4 py-3 text-sm md:text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hide-scrollbar shadow-sm"
            />
            <Button
              onClick={sendMessage}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white whitespace-nowrap md:px-6 md:py-5 md:text-base shadow-md hover:shadow-lg transition-all btn-enhanced">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
              Enviar
            </Button>
            <Button
              onClick={startCamera}
              variant="outline"
              className="border-primary/30 hover:bg-primary/20 md:px-4 md:py-5 md:text-base shadow-sm hover:shadow-md transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

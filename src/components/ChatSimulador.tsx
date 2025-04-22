'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChatSimulador() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [showCamera, setShowCamera] = useState(false);
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
      const fakeUrl = 'https://picsum.photos/300/200';
      setMediaUrl(fakeUrl);
      video.srcObject.getTracks().forEach((track) => track.stop());
      setShowCamera(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !mediaUrl) return;

    const userMessage = {
      sender: 'user',
      text: input || '[imagem enviada]',
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
          message: input || '',
          sessionId: sessionId || undefined,
          mediaUrl: mediaUrl || undefined,
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
      setMediaUrl('');
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) return; // Permite quebra de linha
      e.preventDefault(); // Impede quebra de linha
      sendMessage();
    }
  };
  
  // Phone number input screen
  if (!isChatReady) {
    return (
      <Card className="max-w-md mx-auto mt-10 h-[700px] flex flex-col">
        <CardContent className="flex flex-col items-center justify-center h-full gap-4">
          <h2 className="text-xl font-bold">Simulador de Chat</h2>
          <p className="text-sm text-gray-500 text-center">
            Digite o número de telefone para iniciar a conversa
          </p>
          <Input
            placeholder="Digite o número (apenas dígitos)"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            className="max-w-[80%]"
            onKeyPress={(e) => e.key === 'Enter' && startChat()}
          />
          <Button onClick={startChat}>Iniciar Chat</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-10 h-[700px] flex flex-col">
      <CardContent className="flex-1 overflow-y-auto space-y-2 p-4 bg-gray-100 rounded">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm p-2 rounded max-w-[80%] whitespace-pre-wrap break-words ${msg.sender === 'user'
                ? 'bg-green-200 self-end ml-auto'
                : 'bg-white self-start mr-auto'
              }`}
          >
            {msg.text}
          </div>

        ))}
        {mediaUrl && (
          <div className="text-xs text-gray-500">Imagem capturada: {mediaUrl}</div>
        )}
      </CardContent>

      {showCamera && (
        <div className="flex flex-col items-center gap-2 p-2 border-t">
          <video ref={videoRef} autoPlay className="w-full rounded" />
          <canvas ref={canvasRef} className="hidden" />
          <Button onClick={captureImage}>Capturar</Button>
        </div>
      )}

      <div className="flex items-center p-2 border-t gap-2">
        <Input
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <Button onClick={sendMessage} disabled={loading}>
          Enviar
        </Button>
        <Button onClick={startCamera} variant="outline">
          📷
        </Button>
      </div>
    </Card>
  );
}

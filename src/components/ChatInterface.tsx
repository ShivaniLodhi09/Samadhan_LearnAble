import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Bot,
  User,
  Camera
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  inputType?: 'text' | 'voice' | 'image';
}

interface ChatInterfaceProps {
  language: string;
  modality: string;
  emotion: number;
  onSendMessage?: (message: string, type: 'text' | 'voice' | 'image') => void;
  autoFocus?: boolean;
  generateBotReply?: (message: string, type: 'text' | 'voice' | 'image') => Promise<string | null>;
  ttsEnabled?: boolean;
}

const botResponses = {
  en: {
    greeting: "Hi, I'm LearnAble! Ask me anything about your learning journey. I'm here to help! 😊",
    confused: "I can see you might be confused. Let me explain that differently...",
    happy: "I'm so glad you're enjoying learning! Let's explore more together!",
    frustrated: "I understand this might be challenging. Let me break it down into smaller steps.",
  },
  hi: {
    greeting: "नमस्ते! मैं LearnAble हूँ। आपकी सीखने की यात्रा में मदद के लिए यहाँ हूँ! 😊",
    confused: "मैं देख सकता हूँ कि आप भ्रमित हो सकते हैं। मुझे इसे अलग तरीके से समझाने दें...",
    happy: "मुझे खुशी है कि आप सीखने का आनंद ले रहे हैं! आइए एक साथ और अधिक अन्वेषण करें!",
    frustrated: "मैं समझता हूँ कि यह चुनौतीपूर्ण हो सकता है। मुझे इसे छोटे चरणों में तोड़ने दें।",
  },
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  language,
  modality,
  emotion,
  onSendMessage,
  autoFocus = false,
  generateBotReply,
  ttsEnabled = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsOn, setIsTtsOn] = useState<boolean>(ttsEnabled);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentResponses = botResponses[language as keyof typeof botResponses] || botResponses.en;

  useEffect(() => {
    // Add initial greeting message
    const greetingMessage: Message = {
      id: '1',
      type: 'bot',
      content: currentResponses.greeting,
      timestamp: new Date(),
    };
    setMessages([greetingMessage]);
  }, [language]);

  useEffect(() => {
    // Sync external toggle
    setIsTtsOn(ttsEnabled);
  }, [ttsEnabled]);

  useEffect(() => {
    return () => {
      // Stop any ongoing speech on unmount
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch { }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    // Emotion-based responses
    if (emotion === 0) return currentResponses.frustrated;
    if (emotion === 4) return currentResponses.happy;
    if (emotion === 1) return currentResponses.confused;

    // Content-based responses
    if (message.includes('help') || message.includes('how')) {
      return "I'd be happy to help! Could you tell me more about what you're trying to learn?";
    }

    if (message.includes('confused') || message.includes('don\'t understand')) {
      return currentResponses.confused;
    }

    if (message.includes('good') || message.includes('great') || message.includes('love')) {
      return currentResponses.happy;
    }

    // Default responses based on modality
    switch (modality) {
      case 'sound':
        return "I can explain this using audio. Would you like me to describe it step by step?";
      case 'visual':
        return "Let me show you this with a visual example. I can create diagrams or use animations to help explain.";
      case 'gesture':
        return "This concept works great with interactive learning! Try tapping or swiping to explore.";
      default:
        return "That's a great question! Let me think about the best way to explain this based on your learning style.";
    }
  };

  const handleSendMessage = async (content: string, type: 'text' | 'voice' | 'image' = 'text') => {
    if (!content.trim() && type === 'text') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content || `[${type} message]`,
      timestamp: new Date(),
      inputType: type,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Fire-and-forget side effect if provided
    onSendMessage?.(content, type);

    const speakIfNeeded = (text: string) => {
      if (modality !== 'sound') return;
      if (!isTtsOn) return;
      if (!text) return;
      try {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const synth = window.speechSynthesis;
        const utter = new SpeechSynthesisUtterance(text);
        // Basic language mapping
        utter.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        utter.rate = 1.0;
        utter.pitch = 1.0;
        synth.cancel(); // stop previous
        synth.speak(utter);
      } catch { }
    };

    try {
      if (generateBotReply) {
        const reply = await generateBotReply(content, type);
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: reply ?? generateBotResponse(content),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
        speakIfNeeded(botResponse.content);
        return;
      }
    } catch (e) {
      // Fall back to local generation on error
    }

    // Default: simulated response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateBotResponse(content),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
      speakIfNeeded(botResponse.content);
    }, 800);
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);

    if (!isRecording) {
      // Start recording
      // In a real implementation, you'd start audio recording here
      setTimeout(() => {
        setIsRecording(false);
        handleSendMessage("Voice message received", 'voice');
      }, 3000);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleSendMessage(`Image uploaded: ${file.name}`, 'image');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Chat Header */}
      <Card className="card-adaptive p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-primary p-2 rounded-xl">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">LearnAble Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Ask me anything - I adapt to your learning style
            </p>
          </div>
          {modality === 'sound' && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => {
                const next = !isTtsOn;
                setIsTtsOn(next);
                try {
                  if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                } catch { }
              }}
              aria-label={isTtsOn ? 'Mute voice response' : 'Enable voice response'}
              title={isTtsOn ? 'Mute voice response' : 'Enable voice response'}
            >
              <Volume2 className={`h-4 w-4 ${isTtsOn ? 'text-primary' : 'opacity-50'}`} />
            </Button>
          )}
        </div>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gradient-adaptive rounded-2xl">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${message.type === 'user'
                ? 'bg-gradient-primary text-white'
                : 'bg-card text-card-foreground shadow-lg'
                } animate-fade-in-up`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'bot' && (
                  <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                )}
                {message.type === 'user' && (
                  <User className="h-4 w-4 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                    {formatTime(message.timestamp)}
                    {message.inputType && message.inputType !== 'text' && (
                      <span className="ml-2">• {message.inputType}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card p-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            className="flex-1 rounded-xl"
            disabled={isLoading}
            autoFocus={autoFocus}
          />

          {/* Voice Input */}
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            onClick={handleVoiceToggle}
            className="hover:scale-110"
            disabled={isLoading}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>

          {/* Image Input */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="hover:scale-110"
            disabled={isLoading}
          >
            <Camera className="h-4 w-4" />
          </Button>

          {/* Send Button */}
          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="hover:scale-110 bg-gradient-primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Volume2, VolumeX, Bot, User, Send, MessageSquare } from 'lucide-react';
import { generateGeminiReply } from '@/lib/gemini';

interface VoiceAssistantProps {
    language: string;
    emotion: number;
    onSendMessage?: (message: string, type: 'text' | 'voice' | 'image') => void;
    generateBotReply?: (message: string, type: 'text' | 'voice' | 'image') => Promise<string | null>;
}

interface Message {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    inputType?: 'text' | 'voice' | 'image';
}

const botResponses = {
    en: {
        greeting: "Hi! I'm your AI voice assistant. Ask me anything and I'll help you learn!",
        listening: "I'm listening... speak now.",
        processing: "Processing your question...",
        error: "Sorry, I didn't catch that. Could you please repeat?",
    },
    hi: {
        greeting: "नमस्ते! मैं आपकी AI आवाज़ सहायक हूँ। कुछ भी पूछें, मैं आपकी मदद करूंगा!",
        listening: "मैं सुन रहा हूँ... अब बोलें।",
        processing: "आपके प्रश्न को संसाधित कर रहा हूँ...",
        error: "क्षमा करें, मैंने नहीं सुना। कृपया दोहराएं।",
    },
};

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
    language,
    emotion,
    onSendMessage,
    generateBotReply,
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isTtsEnabled, setIsTtsEnabled] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const currentResponses = botResponses[language as keyof typeof botResponses] || botResponses.en;

    useEffect(() => {
        // Check if we're on HTTPS or localhost
        const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost';

        if (!isSecureContext) {
            console.warn('Speech recognition requires HTTPS or localhost');
            const greetingMessage: Message = {
                id: '1',
                type: 'bot',
                content: 'Voice features require HTTPS. Please use the text input instead.',
                timestamp: new Date(),
            };
            setMessages([greetingMessage]);
            return;
        }

        // Initialize speech recognition with better error handling
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                try {
                    recognitionRef.current = new SpeechRecognition();

                    const recognition = recognitionRef.current;
                    recognition.continuous = false;
                    recognition.interimResults = true;
                    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
                    recognition.maxAlternatives = 3; // Get more alternatives for better accuracy

                    // Add additional settings for better recognition
                    if ('serviceURI' in recognition) {
                        (recognition as any).serviceURI = 'wss://www.google.com/speech-api/full-duplex/v1/up';
                    }

                    recognition.onstart = () => {
                        console.log('Speech recognition started');
                        setIsListening(true);
                        setCurrentTranscript('');
                    };

                    recognition.onresult = (event) => {
                        console.log('Speech recognition result:', event);
                        let finalTranscript = '';
                        let interimTranscript = '';

                        for (let i = event.resultIndex; i < event.results.length; i++) {
                            const transcript = event.results[i][0].transcript;
                            console.log(`Transcript ${i}:`, transcript, 'isFinal:', event.results[i].isFinal);
                            if (event.results[i].isFinal) {
                                finalTranscript += transcript;
                            } else {
                                interimTranscript += transcript;
                            }
                        }

                        setCurrentTranscript(interimTranscript);

                        if (finalTranscript) {
                            console.log('Final transcript:', finalTranscript);
                            // Add a small delay to ensure the recognition has fully processed
                            setTimeout(() => {
                                handleVoiceInput(finalTranscript.trim());
                            }, 100);
                        }
                    };

                    recognition.onerror = (event) => {
                        console.error('Speech recognition error:', event.error);
                        setIsListening(false);
                        setCurrentTranscript('');

                        if (event.error === 'no-speech') {
                            speakText(currentResponses.error);
                        } else if (event.error === 'not-allowed') {
                            console.error('Microphone access denied');
                            speakText('Please allow microphone access to use voice features.');
                        } else if (event.error === 'service-not-allowed') {
                            console.error('Speech recognition service not allowed');
                            speakText('Speech recognition is not available. Please use text input.');
                        }
                    };

                    recognition.onend = () => {
                        console.log('Speech recognition ended');
                        setIsListening(false);
                        setCurrentTranscript('');
                    };

                    console.log('Speech recognition initialized successfully');
                } catch (error) {
                    console.error('Failed to initialize speech recognition:', error);
                }
            } else {
                console.warn('Speech recognition not supported in this browser');
                const greetingMessage: Message = {
                    id: '1',
                    type: 'bot',
                    content: 'Voice recognition not supported in this browser. Please use text input.',
                    timestamp: new Date(),
                };
                setMessages([greetingMessage]);
                return;
            }
        }

        // Add initial greeting
        const greetingMessage: Message = {
            id: '1',
            type: 'bot',
            content: currentResponses.greeting + " I'm your AI voice assistant powered by Gemini. I can help answer questions, provide explanations, and assist with learning. How can I help you today?",
            timestamp: new Date(),
        };
        setMessages([greetingMessage]);

        // Speak the greeting after a short delay
        setTimeout(() => {
            speakText(greetingMessage.content);
        }, 1000);

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [language]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const speakText = (text: string) => {
        if (!isTtsEnabled || !text) {
            console.log('TTS disabled or no text:', { isTtsEnabled, text });
            return;
        }

        console.log('Attempting to speak text:', text);

        try {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                const synth = window.speechSynthesis;

                // Cancel any ongoing speech
                synth.cancel();

                // Wait a moment for cancel to complete
                setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
                    utterance.rate = 0.9;
                    utterance.pitch = 1.0;
                    utterance.volume = 0.8;

                    // Add event listeners for debugging
                    utterance.onstart = () => {
                        console.log('Speech started:', text);
                        setIsSpeaking(true);
                    };

                    utterance.onend = () => {
                        console.log('Speech ended:', text);
                        setIsSpeaking(false);
                    };

                    utterance.onerror = (event) => {
                        console.error('Speech error:', event.error);
                        setIsSpeaking(false);
                    };

                    synth.speak(utterance);
                    console.log('Speech synthesis initiated');
                }, 100);
            } else {
                console.warn('Speech synthesis not supported in this browser');
            }
        } catch (error) {
            console.error('TTS error:', error);
        }
    };

    const handleInput = async (content: string, type: 'text' | 'voice' = 'text') => {
        if (!content.trim()) return;

        console.log('Handling input:', { content, type });

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: content,
            timestamp: new Date(),
            inputType: type,
        };

        setMessages(prev => [...prev, userMessage]);
        setIsProcessing(true);
        setIsLoading(true);

        // Call the webhook if provided
        onSendMessage?.(content, type);

        try {
            let botReply = '';

            // Try webhook first if available
            if (generateBotReply) {
                console.log('Calling webhook generateBotReply...');
                try {
                    const webhookReply = await generateBotReply(content, type);
                    console.log('Webhook reply received:', webhookReply);
                    console.log('Webhook reply type:', typeof webhookReply);
                    console.log('Webhook reply length:', webhookReply?.length);

                    if (webhookReply && webhookReply.trim()) {
                        botReply = webhookReply.trim();
                        console.log('Using webhook response:', botReply);
                    } else {
                        console.warn('Empty or invalid webhook response, falling back to Gemini');
                        throw new Error('Empty webhook response');
                    }
                } catch (webhookError) {
                    console.log('Webhook failed, falling back to Gemini:', webhookError);
                    // Fallback to Gemini API with specialized prompt
                    const prompt = `You are a helpful AI voice assistant specializing in audio and voice-based learning. User language: ${language}. 
          
          Provide helpful, educational responses focused on audio learning techniques, voice training, pronunciation, listening skills, and auditory memory techniques. Be encouraging and supportive. Keep responses concise but informative and suitable for voice output.
          
          User question: ${content}`;
                    botReply = await generateGeminiReply(prompt, language);
                    console.log('Using Gemini fallback response:', botReply);
                }
            } else {
                // Use Gemini API directly with specialized prompt
                console.log('Using Gemini API directly...');
                const prompt = `You are a helpful AI voice assistant specializing in audio and voice-based learning. User language: ${language}. 
        
        Provide helpful, educational responses focused on audio learning techniques, voice training, pronunciation, listening skills, and auditory memory techniques. Be encouraging and supportive. Keep responses concise but informative and suitable for voice output.
        
        User question: ${content}`;
                botReply = await generateGeminiReply(prompt, language);
                console.log('Using Gemini direct response:', botReply);
            }

            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: botReply,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botResponse]);

            // Speak the response immediately
            console.log('About to speak response:', botReply);
            setTimeout(() => {
                speakText(botReply);
            }, 500); // Small delay to ensure message is rendered
        } catch (error) {
            console.error('Error generating response:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: `I understand you said: "${content}". I'm having trouble processing that right now. Could you please try again or rephrase your question?`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);

            // Speak the error message
            setTimeout(() => {
                speakText(errorMessage.content);
            }, 500);
        } finally {
            setIsProcessing(false);
            setIsLoading(false);
        }
    };

    const handleVoiceInput = async (transcript: string) => {
        await handleInput(transcript, 'voice');
    };

    const handleTextSubmit = async () => {
        if (!inputValue.trim()) return;
        await handleInput(inputValue, 'text');
        setInputValue('');
    };

    const requestMicrophonePermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
            return true;
        } catch (error) {
            console.error('Microphone permission denied:', error);
            return false;
        }
    };

    const startListening = async () => {
        if (!recognitionRef.current) {
            console.error('Speech recognition not initialized');
            speakText('Voice recognition is not available. Please use text input.');
            return;
        }

        if (isListening) {
            console.log('Already listening');
            return;
        }

        // Request microphone permission first
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
            speakText('Microphone access is required for voice features. Please allow microphone access and try again.');
            return;
        }

        try {
            console.log('Starting speech recognition...');
            recognitionRef.current.start();
            speakText(currentResponses.listening);
        } catch (error) {
            console.error('Error starting speech recognition:', error);

            if (error.name === 'InvalidStateError') {
                // Recognition is already running, stop and restart
                console.log('Recognition already running, restarting...');
                recognitionRef.current.stop();
                setTimeout(() => {
                    try {
                        recognitionRef.current?.start();
                    } catch (e) {
                        console.error('Failed to restart recognition:', e);
                        speakText('Failed to start voice recognition. Please try again.');
                    }
                }, 100);
            } else if (error.name === 'NotAllowedError') {
                speakText('Microphone access denied. Please allow microphone access and try again.');
            } else {
                speakText('Voice recognition failed. Please use text input instead.');
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full max-h-[600px]">
            {/* Voice Assistant Header */}
            <Card className="card-adaptive p-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-lavender to-lavender-deep p-2 rounded-xl">
                        <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="font-semibold">AI Voice Assistant</h2>
                        <p className="text-sm text-muted-foreground">
                            Speak naturally - I'll listen and respond
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                        className="hover:scale-110"
                        aria-label={isTtsEnabled ? 'Disable voice output' : 'Enable voice output'}
                    >
                        {isTtsEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
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

                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-card p-4 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4" />
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div>
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                                </div>
                                <span className="text-sm text-muted-foreground ml-2">
                                    {currentResponses.processing}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {currentTranscript && (
                    <div className="flex justify-start">
                        <div className="bg-muted p-4 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <Mic className="h-4 w-4 text-primary animate-pulse" />
                                <span className="text-sm text-muted-foreground italic">
                                    "{currentTranscript}"
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Processing Indicator */}
                {isProcessing && !currentTranscript && (
                    <div className="flex justify-start">
                        <div className="bg-muted p-4 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-muted-foreground">
                                    Processing your message...
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Speaking Indicator */}
                {isSpeaking && (
                    <div className="flex justify-start">
                        <div className="bg-muted p-4 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                                <span className="text-sm text-muted-foreground">
                                    Speaking response...
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Webhook Response Indicator */}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-blue-700">
                                    Fetching response from webhook...
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
                {/* Text Input */}
                <div className="flex items-center gap-2 mb-4">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                        className="flex-1 rounded-xl"
                        disabled={isLoading || isProcessing}
                    />
                    <Button
                        onClick={handleTextSubmit}
                        disabled={!inputValue.trim() || isLoading || isProcessing}
                        className="hover:scale-110 bg-gradient-primary"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>

                {/* Voice Controls */}
                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant={isListening ? "destructive" : "default"}
                        size="lg"
                        onClick={isListening ? stopListening : startListening}
                        className={`${isListening
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                            : 'bg-gradient-primary hover:scale-105'
                            } transition-all duration-300`}
                        disabled={isProcessing || isLoading}
                    >
                        {isListening ? (
                            <>
                                <MicOff className="h-5 w-5 mr-2" />
                                Stop Listening
                            </>
                        ) : (
                            <>
                                <Mic className="h-5 w-5 mr-2" />
                                Start Speaking
                            </>
                        )}
                    </Button>

                    {/* Test Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInput("Test message from button", 'text')}
                        className="hover:scale-105"
                        disabled={isProcessing || isLoading}
                    >
                        Test
                    </Button>

                    {/* TTS Test Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => speakText("Hello! This is a test of the text to speech feature. Can you hear me?")}
                        className="hover:scale-105"
                        disabled={!isTtsEnabled}
                    >
                        Test Voice
                    </Button>

                    {/* Webhook Test Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInput("Test webhook response", 'text')}
                        className="hover:scale-105"
                        disabled={isProcessing || isLoading}
                    >
                        Test Webhook
                    </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-2">
                    {isListening
                        ? 'Speak your question now...'
                        : 'Type a message or click the microphone to start a voice conversation'
                    }
                </p>
            </div>
        </div>
    );
};

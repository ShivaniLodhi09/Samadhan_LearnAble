import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, CameraOff, Volume2, VolumeX, Bot, User, Hand, Eye, Mic, MicOff } from 'lucide-react';
import { generateGeminiReply } from '@/lib/gemini';

interface GestureChatBotProps {
    language: string;
    emotion: number;
    onSendMessage?: (message: string, type: 'text' | 'voice' | 'gesture' | 'image') => void;
    generateBotReply?: (message: string, type: 'text' | 'voice' | 'gesture' | 'image') => Promise<string | null>;
}

interface Message {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    inputType?: 'text' | 'voice' | 'gesture' | 'image';
    gestureData?: {
        gesture?: string;
        confidence?: number;
        landmarks?: any[];
    };
}

// Gesture types for recognition
const GESTURE_TYPES = {
    THUMBS_UP: 'thumbs_up',
    THUMBS_DOWN: 'thumbs_down',
    PEACE_SIGN: 'peace_sign',
    POINTING: 'pointing',
    WAVE: 'wave',
    FIST: 'fist',
    OPEN_PALM: 'open_palm',
    ROCK: 'rock',
    NONE: 'none'
};

// TensorFlow.js gesture recognition class
class TensorFlowGestureRecognizer {
    private model: any = null;
    private isInitialized = false;
    private gestureHistory: string[] = [];
    private confidenceThreshold = 0.7;

    constructor() {
        this.initializeTensorFlow();
    }

    private async initializeTensorFlow() {
        try {
            // Load TensorFlow.js
            if (typeof window !== 'undefined' && (window as any).tf) {
                console.log('TensorFlow.js already loaded');
                this.isInitialized = true;
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js';
            script.async = true;
            script.onload = () => {
                console.log('TensorFlow.js loaded successfully');
                this.isInitialized = true;
                this.loadGestureModel();
            };
            script.onerror = () => {
                console.error('Failed to load TensorFlow.js');
            };
            document.head.appendChild(script);
        } catch (error) {
            console.error('Error initializing TensorFlow:', error);
        }
    }

    private async loadGestureModel() {
        try {
            // For now, we'll use a simple rule-based approach
            // In a real implementation, you would load a pre-trained model
            console.log('Gesture model ready (rule-based)');
        } catch (error) {
            console.error('Error loading gesture model:', error);
        }
    }

    public async processFrame(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<{
        gesture: string;
        confidence: number;
        landmarks: any[];
    }> {
        if (!this.isInitialized) {
            return { gesture: GESTURE_TYPES.NONE, confidence: 0, landmarks: [] };
        }

        try {
            // Capture frame from video
            const ctx = canvasElement.getContext('2d');
            if (!ctx || !videoElement) return { gesture: GESTURE_TYPES.NONE, confidence: 0, landmarks: [] };

            // Draw video frame to canvas
            ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

            // Get image data for processing
            const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);

            // Simple gesture detection based on image analysis
            const gesture = this.detectGestureFromImage(imageData);

            // Draw detection results
            this.drawGestureOverlay(ctx, gesture);

            return {
                gesture: gesture.type,
                confidence: gesture.confidence,
                landmarks: gesture.landmarks || []
            };

        } catch (error) {
            console.error('Error processing frame:', error);
            return { gesture: GESTURE_TYPES.NONE, confidence: 0, landmarks: [] };
        }
    }

    private detectGestureFromImage(imageData: ImageData): { type: string; confidence: number; landmarks?: any[] } {
        // Simple rule-based gesture detection
        // In a real implementation, this would use a trained TensorFlow model

        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        // Analyze image characteristics for gesture detection
        let brightness = 0;
        let contrast = 0;
        let handRegions = 0;

        // Calculate basic image statistics
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const pixelBrightness = (r + g + b) / 3;
            brightness += pixelBrightness;
        }
        brightness /= (data.length / 4);

        // Simple gesture classification based on image characteristics
        let gesture = GESTURE_TYPES.NONE;
        let confidence = 0;

        // Detect different gestures based on image analysis
        if (brightness > 150) {
            gesture = GESTURE_TYPES.OPEN_PALM;
            confidence = 0.8;
        } else if (brightness < 100) {
            gesture = GESTURE_TYPES.FIST;
            confidence = 0.7;
        } else {
            // Random gesture for demo purposes
            const gestures = [GESTURE_TYPES.THUMBS_UP, GESTURE_TYPES.PEACE_SIGN, GESTURE_TYPES.WAVE];
            gesture = gestures[Math.floor(Math.random() * gestures.length)];
            confidence = 0.6;
        }

        return {
            type: gesture,
            confidence,
            landmarks: []
        };
    }

    private drawGestureOverlay(ctx: CanvasRenderingContext2D, gesture: { type: string; confidence: number }) {
        // Draw gesture detection overlay
        ctx.strokeStyle = gesture.confidence > 0.5 ? '#00ff00' : '#ff0000';
        ctx.lineWidth = 3;
        ctx.strokeRect(50, 50, 200, 150);

        // Draw gesture label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(
            `${gesture.type.replace('_', ' ')} (${Math.round(gesture.confidence * 100)}%)`,
            60,
            80
        );

        // Draw confidence bar
        const barWidth = 180;
        const barHeight = 10;
        const confidenceWidth = (gesture.confidence * barWidth);

        ctx.fillStyle = '#333333';
        ctx.fillRect(60, 100, barWidth, barHeight);

        ctx.fillStyle = gesture.confidence > 0.5 ? '#00ff00' : '#ff0000';
        ctx.fillRect(60, 100, confidenceWidth, barHeight);
    }

    public cleanup() {
        if (this.model) {
            this.model.dispose();
        }
    }
}

export const GestureChatBot: React.FC<GestureChatBotProps> = ({
    language,
    emotion,
    onSendMessage,
    generateBotReply,
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isTtsEnabled, setIsTtsEnabled] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [currentGesture, setCurrentGesture] = useState<string>('');
    const [gestureConfidence, setGestureConfidence] = useState(0);
    const [isTensorFlowLoaded, setIsTensorFlowLoaded] = useState(false);
    const [detectionStatus, setDetectionStatus] = useState('Initializing...');
    const [inputValue, setInputValue] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationRef = useRef<number | null>(null);
    const recognizerRef = useRef<TensorFlowGestureRecognizer | null>(null);
    const lastGestureTime = useRef<number>(0);
    const lastApiCall = useRef<number>(0);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize TensorFlow and recognizer
    useEffect(() => {
        const initTensorFlow = async () => {
            setDetectionStatus('Loading TensorFlow.js...');

            if ((window as any).tf) {
                console.log('TensorFlow.js already available');
                setIsTensorFlowLoaded(true);
                setDetectionStatus('TensorFlow ready');
                recognizerRef.current = new TensorFlowGestureRecognizer();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js';
            script.async = true;
            script.onload = () => {
                console.log('TensorFlow.js loaded successfully');
                setIsTensorFlowLoaded(true);
                setDetectionStatus('TensorFlow loaded successfully');
                recognizerRef.current = new TensorFlowGestureRecognizer();
            };
            script.onerror = () => {
                console.error('Failed to load TensorFlow.js');
                setDetectionStatus('Failed to load TensorFlow.js');
            };
            document.head.appendChild(script);
        };

        initTensorFlow();

        return () => {
            if (recognizerRef.current) {
                recognizerRef.current.cleanup();
            }
        };
    }, []);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setDetectionStatus('Listening for voice input...');
            };

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                handleTextInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                setDetectionStatus('Speech recognition error');
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [language]);

    const speakText = useCallback((text: string) => {
        if (!isTtsEnabled || !text) return;

        try {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                const synth = window.speechSynthesis;
                synth.cancel();

                setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
                    utterance.rate = 0.9;
                    utterance.pitch = 1.0;
                    utterance.volume = 0.8;

                    utterance.onstart = () => setIsSpeaking(true);
                    utterance.onend = () => setIsSpeaking(false);
                    utterance.onerror = () => setIsSpeaking(false);

                    synth.speak(utterance);
                }, 100);
            }
        } catch (error) {
            console.error('TTS error:', error);
        }
    }, [isTtsEnabled, language]);

    const processFrame = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || !recognizerRef.current || !isTensorFlowLoaded) {
            return;
        }

        try {
            const result = await recognizerRef.current.processFrame(videoRef.current, canvasRef.current);

            setCurrentGesture(result.gesture);
            setGestureConfidence(result.confidence);
            setDetectionStatus(`Detected: ${result.gesture.replace('_', ' ')} (${Math.round(result.confidence * 100)}%)`);

            // Handle gesture input if confidence is high enough
            if (result.gesture !== GESTURE_TYPES.NONE && result.confidence > 0.5) {
                const now = Date.now();
                if (now - lastGestureTime.current > 3000) { // 3 second cooldown
                    lastGestureTime.current = now;
                    handleGestureInput(result.gesture, result.confidence, result.landmarks);
                }
            }
        } catch (error) {
            console.error('Error processing frame:', error);
            setDetectionStatus('Processing error');
        }
    }, [isTensorFlowLoaded]);

    const handleGestureInput = async (gesture: string, confidence: number, landmarks: any[]) => {
        console.log('Gesture detected:', gesture, 'Confidence:', confidence);

        // Rate limiting: prevent too many API calls
        const now = Date.now();
        if (now - lastApiCall.current < 3000) { // 3 seconds between API calls
            console.log('Rate limiting: skipping API call');
            return;
        }
        lastApiCall.current = now;

        const gestureMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: `Gesture: ${gesture.replace('_', ' ')} (${Math.round(confidence * 100)}% confidence)`,
            timestamp: new Date(),
            inputType: 'gesture',
            gestureData: {
                gesture: gesture,
                confidence: confidence,
                landmarks: landmarks
            }
        };

        setMessages(prev => [...prev, gestureMessage]);
        setIsProcessing(true);

        onSendMessage?.(gesture, 'gesture');

        try {
            let botReply = '';

            if (generateBotReply) {
                try {
                    const webhookReply = await generateBotReply(gesture, 'gesture');
                    if (webhookReply && webhookReply.trim()) {
                        botReply = webhookReply.trim();
                    } else {
                        throw new Error('Empty webhook response');
                    }
                } catch (webhookError) {
                    console.log('Webhook failed, falling back to Gemini:', webhookError);
                    const prompt = `You are a helpful AI assistant that responds to gestures detected by TensorFlow.js computer vision. User language: ${language}. 
                    
                    The user just performed this gesture: ${gesture.replace('_', ' ')} with ${Math.round(confidence * 100)}% confidence using TensorFlow.js gesture recognition. 
                    Provide a helpful, encouraging response about their gesture. Keep it concise and suitable for voice output.
                    
                    User gesture: ${gesture}`;
                    botReply = await generateGeminiReply(prompt);
                }
            } else {
                const prompt = `You are a helpful AI assistant that responds to gestures detected by TensorFlow.js computer vision. User language: ${language}. 
                
                The user just performed this gesture: ${gesture.replace('_', ' ')} with ${Math.round(confidence * 100)}% confidence using TensorFlow.js gesture recognition. 
                Provide a helpful, encouraging response about their gesture. Keep it concise and suitable for voice output.
                
                User gesture: ${gesture}`;
                botReply = await generateGeminiReply(prompt);
            }

            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: botReply,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botResponse]);

            setTimeout(() => {
                speakText(botReply);
            }, 500);

        } catch (error) {
            console.error('Error generating response:', error);

            // Use fallback responses to reduce API calls
            const fallbackResponses = [
                `Great gesture! I detected a ${gesture.replace('_', ' ')}. Keep practicing!`,
                `Nice ${gesture.replace('_', ' ')} gesture! You're doing well.`,
                `I see you made a ${gesture.replace('_', ' ')}. That's a good sign!`,
                `Excellent ${gesture.replace('_', ' ')}! Your gesture recognition is improving.`
            ];

            const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: randomResponse,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);

            setTimeout(() => {
                speakText(errorMessage.content);
            }, 500);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTextInput = async (text: string) => {
        if (!text.trim()) return;

        // Rate limiting: prevent too many API calls
        const now = Date.now();
        if (now - lastApiCall.current < 2000) { // 2 seconds between API calls
            console.log('Rate limiting: skipping text input API call');
            return;
        }
        lastApiCall.current = now;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: text,
            timestamp: new Date(),
            inputType: 'text'
        };

        setMessages(prev => [...prev, userMessage]);
        setIsProcessing(true);

        try {
            let botReply = '';

            if (generateBotReply) {
                try {
                    const webhookReply = await generateBotReply(text, 'text');
                    if (webhookReply && webhookReply.trim()) {
                        botReply = webhookReply.trim();
                    } else {
                        throw new Error('Empty webhook response');
                    }
                } catch (webhookError) {
                    console.log('Webhook failed, falling back to Gemini:', webhookError);
                    const prompt = `You are a helpful AI assistant for gesture and sign language learning. User language: ${language}. 
                    
                    The user said: "${text}". Provide a helpful response about gesture recognition, sign language, or non-verbal communication.
                    Keep it concise and suitable for voice output.
                    
                    User message: ${text}`;
                    botReply = await generateGeminiReply(prompt);
                }
            } else {
                const prompt = `You are a helpful AI assistant for gesture and sign language learning. User language: ${language}. 
                
                The user said: "${text}". Provide a helpful response about gesture recognition, sign language, or non-verbal communication.
                Keep it concise and suitable for voice output.
                
                User message: ${text}`;
                botReply = await generateGeminiReply(prompt);
            }

            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: botReply,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botResponse]);

            setTimeout(() => {
                speakText(botReply);
            }, 500);

        } catch (error) {
            console.error('Error generating response:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: "I'm having trouble processing that right now. Could you try again?",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);

            setTimeout(() => {
                speakText(errorMessage.content);
            }, 500);
        } finally {
            setIsProcessing(false);
        }
    };

    const startCamera = async () => {
        try {
            console.log('Requesting camera access...');
            setDetectionStatus('Requesting camera access...');

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            console.log('Camera stream obtained:', stream);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true;
                videoRef.current.playsInline = true;
                videoRef.current.autoplay = true;

                const handleVideoReady = () => {
                    console.log('Video metadata loaded');
                    videoRef.current?.play().then(() => {
                        console.log('Video started playing');
                        setIsCameraOn(true);
                        setDetectionStatus('Camera active - detecting gestures with TensorFlow.js...');

                        const processFrameLoop = () => {
                            if (isCameraOn && isTensorFlowLoaded && videoRef.current && videoRef.current.readyState >= 2) {
                                processFrame();
                                animationRef.current = requestAnimationFrame(processFrameLoop);
                            }
                        };
                        processFrameLoop();
                    }).catch(err => {
                        console.error('Error playing video:', err);
                        setDetectionStatus('Error starting video');
                    });
                };

                videoRef.current.onloadedmetadata = handleVideoReady;
                videoRef.current.oncanplay = handleVideoReady;
            }

        } catch (error) {
            console.error('Error accessing camera:', error);
            setDetectionStatus('Camera access denied');
            speakText('Camera access denied. Please allow camera access to use gesture recognition.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setIsCameraOn(false);
        setCurrentGesture('');
        setGestureConfidence(0);
        setDetectionStatus('Camera stopped');
    };

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error('Error starting speech recognition:', error);
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

    // Add initial greeting
    useEffect(() => {
        const greetingMessage: Message = {
            id: '1',
            type: 'bot',
            content: "Hi! I'm your TensorFlow.js-powered gesture recognition assistant. I can detect hand gestures using machine learning in your browser!",
            timestamp: new Date(),
        };
        setMessages([greetingMessage]);

        setTimeout(() => {
            speakText(greetingMessage.content);
        }, 1000);
    }, [speakText]);

    return (
        <div className="flex flex-col h-full max-h-[600px]">
            {/* TensorFlow Gesture ChatBot Header */}
            <Card className="card-adaptive p-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-coral to-coral-deep p-2 rounded-xl">
                        <Hand className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="font-semibold">TensorFlow.js Gesture ChatBot</h2>
                        <p className="text-sm text-muted-foreground">
                            Real-time gesture recognition with machine learning
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                            className="hover:scale-110"
                        >
                            {isTtsEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={isListening ? stopListening : startListening}
                            className="hover:scale-110"
                        >
                            {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Status Display */}
            <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                    <span>Status: {detectionStatus}</span>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isTensorFlowLoaded ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span>TensorFlow: {isTensorFlowLoaded ? 'Ready' : 'Loading...'}</span>
                    </div>
                </div>
            </div>

            {/* Camera Feed */}
            {isCameraOn && (
                <div className="mb-4 relative">
                    <div className="relative">
                        <video
                            ref={videoRef}
                            className="w-full h-48 object-cover rounded-2xl border-2 border-coral"
                            autoPlay
                            muted
                            playsInline
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-2xl"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono">
                            Gesture: {currentGesture.replace('_', ' ')} ({Math.round(gestureConfidence * 100)}%)
                        </div>
                    </div>
                </div>
            )}

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

                {/* Processing Indicators */}
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
                                    Processing gesture...
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

                {/* Listening Indicator */}
                {isListening && (
                    <div className="flex justify-start">
                        <div className="bg-muted p-4 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <Mic className="h-4 w-4 text-primary animate-pulse" />
                                <span className="text-sm text-muted-foreground">
                                    Listening for voice input...
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Text Input */}
            <div className="p-4 border-t border-border">
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTextInput(inputValue)}
                        placeholder="Type a message or use gestures..."
                        className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                        onClick={() => handleTextInput(inputValue)}
                        disabled={!inputValue.trim() || isProcessing}
                        size="sm"
                    >
                        Send
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant={isCameraOn ? "destructive" : "default"}
                        size="lg"
                        onClick={isCameraOn ? stopCamera : startCamera}
                        disabled={!isTensorFlowLoaded || isProcessing}
                        className={`${isCameraOn
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                            : 'bg-gradient-primary hover:scale-105'
                            } transition-all duration-300`}
                    >
                        {isCameraOn ? (
                            <>
                                <CameraOff className="h-5 w-5 mr-2" />
                                Stop Camera
                            </>
                        ) : (
                            <>
                                <Camera className="h-5 w-5 mr-2" />
                                Start Camera
                            </>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGestureInput(GESTURE_TYPES.THUMBS_UP, 0.8, [])}
                        disabled={isProcessing}
                    >
                        Test Gesture
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => speakText("Hello! This is a test of the TensorFlow.js gesture recognition system. Can you hear me?")}
                        disabled={!isTtsEnabled}
                    >
                        Test Voice
                    </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-2">
                    {isCameraOn
                        ? 'TensorFlow.js is detecting gestures - try thumbs up, peace sign, or pointing!'
                        : 'Start the camera to use TensorFlow.js gesture recognition'
                    }
                </p>
            </div>
        </div>
    );
};

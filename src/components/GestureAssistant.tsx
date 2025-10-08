import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, CameraOff, Mic, MicOff, Volume2, VolumeX, Bot, User, Send, Hand, Eye, Smile } from 'lucide-react';
import { generateGeminiReply } from '@/lib/gemini';

interface GestureAssistantProps {
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
        expression?: string;
        handGesture?: string;
        confidence?: number;
    };
}

const gestureResponses = {
    en: {
        greeting: "Hi! I'm your gesture recognition assistant. I can see your expressions and hand movements!",
        listening: "I'm watching your gestures...",
        processing: "Analyzing your gestures...",
        error: "I didn't catch that gesture. Could you try again?",
    },
    hi: {
        greeting: "नमस्ते! मैं आपका जेस्चर रिकग्निशन असिस्टेंट हूं। मैं आपके भाव और हाथों की हरकत देख सकता हूं!",
        listening: "मैं आपके जेस्चर देख रहा हूं...",
        processing: "आपके जेस्चर का विश्लेषण कर रहा हूं...",
        error: "मैंने वो जेस्चर नहीं पकड़ा। कृपया दोबारा कोशिश करें।",
    },
};

// Gesture recognition states
const GESTURE_STATES = {
    HANDS_UP: 'hands_up',
    THUMBS_UP: 'thumbs_up',
    THUMBS_DOWN: 'thumbs_down',
    POINTING: 'pointing',
    WAVE: 'wave',
    PEACE: 'peace',
    FIST: 'fist',
    OPEN_PALM: 'open_palm',
    NONE: 'none'
};

// Facial expression states
const EXPRESSION_STATES = {
    HAPPY: 'happy',
    SAD: 'sad',
    ANGRY: 'angry',
    SURPRISED: 'surprised',
    FEARFUL: 'fearful',
    DISGUSTED: 'disgusted',
    NEUTRAL: 'neutral'
};

export const GestureAssistant: React.FC<GestureAssistantProps> = ({
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
    const [currentGesture, setCurrentGesture] = useState<string>('');
    const [currentExpression, setCurrentExpression] = useState<string>('');
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [gestureConfidence, setGestureConfidence] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationRef = useRef<number | null>(null);
    const lastGestureTime = useRef<number>(0);

    const currentResponses = gestureResponses[language as keyof typeof gestureResponses] || gestureResponses.en;

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
                synth.cancel();

                setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
                    utterance.rate = 0.9;
                    utterance.pitch = 1.0;
                    utterance.volume = 0.8;

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

    // Simple gesture recognition using hand landmarks
    const detectGesture = (landmarks: any[]): string => {
        if (!landmarks || landmarks.length === 0) return GESTURE_STATES.NONE;

        // Get key points for gesture detection
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        const thumbIp = landmarks[3];
        const indexPip = landmarks[6];
        const middlePip = landmarks[10];
        const ringPip = landmarks[14];
        const pinkyPip = landmarks[18];

        // Calculate distances and angles for gesture recognition
        const thumbUp = thumbTip.y < thumbIp.y;
        const indexUp = indexTip.y < indexPip.y;
        const middleUp = middleTip.y < middlePip.y;
        const ringUp = ringTip.y < ringPip.y;
        const pinkyUp = pinkyTip.y < pinkyPip.y;

        const fingersUp = [thumbUp, indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;

        // Gesture recognition logic
        if (fingersUp === 5) return GESTURE_STATES.OPEN_PALM;
        if (fingersUp === 0) return GESTURE_STATES.FIST;
        if (thumbUp && indexUp && !middleUp && !ringUp && !pinkyUp) return GESTURE_STATES.PEACE;
        if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) return GESTURE_STATES.THUMBS_UP;
        if (!thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) return GESTURE_STATES.THUMBS_DOWN;
        if (indexUp && !middleUp && !ringUp && !pinkyUp) return GESTURE_STATES.POINTING;

        return GESTURE_STATES.NONE;
    };

    // Simple facial expression detection using face landmarks
    const detectExpression = (landmarks: any[]): string => {
        if (!landmarks || landmarks.length === 0) return EXPRESSION_STATES.NEUTRAL;

        // Key facial landmarks for expression detection
        const leftEye = landmarks[33];
        const rightEye = landmarks[362];
        const nose = landmarks[1];
        const mouthLeft = landmarks[61];
        const mouthRight = landmarks[291];
        const mouthCenter = landmarks[13];

        // Calculate basic expression metrics
        const eyeDistance = Math.abs(leftEye.y - rightEye.y);
        const mouthWidth = Math.abs(mouthLeft.x - mouthRight.x);
        const mouthHeight = Math.abs(mouthCenter.y - mouthLeft.y);

        // Simple expression detection based on ratios
        if (mouthHeight > eyeDistance * 0.3) return EXPRESSION_STATES.HAPPY;
        if (mouthHeight < eyeDistance * 0.1) return EXPRESSION_STATES.SAD;
        if (eyeDistance > mouthWidth * 0.8) return EXPRESSION_STATES.SURPRISED;

        return EXPRESSION_STATES.NEUTRAL;
    };

    // Enhanced gesture detection using hand tracking
    const processFrame = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Enhanced hand detection using multiple methods
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Method 1: Skin color detection
        let skinPixels = 0;
        let handRegions = [];

        for (let y = 0; y < canvas.height; y += 10) {
            for (let x = 0; x < canvas.width; x += 10) {
                const index = (y * canvas.width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];

                // Enhanced skin color detection
                if (r > 95 && g > 40 && b > 20 &&
                    r > g && g > b &&
                    Math.abs(r - g) > 15 &&
                    r > 60 && g > 40 && b > 20) {
                    skinPixels++;
                    handRegions.push({ x, y });
                }
            }
        }

        // Method 2: Motion detection
        let motionPixels = 0;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
            // Simple motion detection by comparing with previous frame
            const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // This is a simplified motion detection - in a real implementation,
            // you'd compare with the previous frame
        }

        // Method 3: Hand shape analysis
        let detectedGesture = GESTURE_STATES.NONE;
        let confidence = 0;

        const skinRatio = skinPixels / ((canvas.width * canvas.height) / 100);

        if (skinRatio > 0.5) {
            // Analyze hand regions for gesture patterns
            if (handRegions.length > 10) {
                // Calculate hand spread
                const handSpread = calculateHandSpread(handRegions);

                if (handSpread > 0.7) {
                    detectedGesture = GESTURE_STATES.OPEN_PALM;
                    confidence = Math.min(skinRatio / 2, 1);
                } else if (handSpread < 0.3) {
                    detectedGesture = GESTURE_STATES.FIST;
                    confidence = Math.min(skinRatio / 2, 1);
                } else {
                    detectedGesture = GESTURE_STATES.THUMBS_UP;
                    confidence = Math.min(skinRatio / 3, 1);
                }
            }
        }

        // Update gesture state
        setCurrentGesture(detectedGesture);
        setGestureConfidence(confidence);

        // Draw detection overlay
        drawDetectionOverlay(ctx, handRegions, detectedGesture, confidence);

        // Simple expression detection
        setCurrentExpression(EXPRESSION_STATES.NEUTRAL);

        // Check for gesture changes
        const now = Date.now();
        if (detectedGesture !== GESTURE_STATES.NONE && confidence > 0.3 && now - lastGestureTime.current > 2000) {
            lastGestureTime.current = now;
            handleGestureInput(detectedGesture, confidence);
        }
    };

    // Calculate hand spread based on region distribution
    const calculateHandSpread = (regions: { x: number, y: number }[]) => {
        if (regions.length < 3) return 0;

        const xs = regions.map(r => r.x);
        const ys = regions.map(r => r.y);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const width = maxX - minX;
        const height = maxY - minY;
        const area = width * height;
        const regionCount = regions.length;

        return regionCount / Math.max(area / 100, 1);
    };

    // Draw detection overlay on canvas
    const drawDetectionOverlay = (ctx: CanvasRenderingContext2D, regions: { x: number, y: number }[], gesture: string, confidence: number) => {
        if (regions.length === 0) return;

        ctx.strokeStyle = confidence > 0.3 ? '#00ff00' : '#ff0000';
        ctx.lineWidth = 2;
        ctx.font = '16px Arial';
        ctx.fillStyle = confidence > 0.3 ? '#00ff00' : '#ff0000';

        // Draw bounding box around hand regions
        if (regions.length > 0) {
            const xs = regions.map(r => r.x);
            const ys = regions.map(r => r.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);

            ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

            // Draw gesture label
            ctx.fillText(`${gesture.replace('_', ' ')} (${Math.round(confidence * 100)}%)`, minX, minY - 10);
        }

        // Draw individual detection points
        regions.forEach((region, index) => {
            if (index % 5 === 0) { // Draw every 5th point to avoid clutter
                ctx.beginPath();
                ctx.arc(region.x, region.y, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    };

    const handleGestureInput = async (gesture: string, confidence: number) => {
        if (gesture === GESTURE_STATES.NONE) return;

        console.log('Gesture detected:', gesture, 'Confidence:', confidence);

        const gestureMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: `Gesture: ${gesture.replace('_', ' ')} (${Math.round(confidence * 100)}% confidence)`,
            timestamp: new Date(),
            inputType: 'gesture',
            gestureData: {
                handGesture: gesture,
                confidence: confidence
            }
        };

        setMessages(prev => [...prev, gestureMessage]);
        setIsProcessing(true);
        setIsLoading(true);

        // Call the webhook if provided
        onSendMessage?.(gesture, 'gesture');

        try {
            let botReply = '';

            // Try webhook first if available
            if (generateBotReply) {
                console.log('Calling webhook generateBotReply...');
                try {
                    const webhookReply = await generateBotReply(gesture, 'gesture');
                    console.log('Webhook reply received:', webhookReply);

                    if (webhookReply && webhookReply.trim()) {
                        botReply = webhookReply.trim();
                        console.log('Using webhook response:', botReply);
                    } else {
                        throw new Error('Empty webhook response');
                    }
                } catch (webhookError) {
                    console.log('Webhook failed, falling back to Gemini:', webhookError);
                    // Fallback to Gemini API
                    const prompt = `You are a helpful AI assistant that responds to gestures and facial expressions. User language: ${language}. 
                    
                    The user just performed this gesture: ${gesture.replace('_', ' ')} with ${Math.round(confidence * 100)}% confidence. 
                    Provide a helpful, encouraging response about their gesture. Keep it concise and suitable for voice output.
                    
                    User gesture: ${gesture}`;
                    botReply = await generateGeminiReply(prompt, language);
                    console.log('Using Gemini fallback response:', botReply);
                }
            } else {
                // Use Gemini API directly
                console.log('Using Gemini API directly...');
                const prompt = `You are a helpful AI assistant that responds to gestures and facial expressions. User language: ${language}. 
                
                The user just performed this gesture: ${gesture.replace('_', ' ')} with ${Math.round(confidence * 100)}% confidence. 
                Provide a helpful, encouraging response about their gesture. Keep it concise and suitable for voice output.
                
                User gesture: ${gesture}`;
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

            // Speak the response
            console.log('About to speak response:', botReply);
            setTimeout(() => {
                speakText(botReply);
            }, 500);

        } catch (error) {
            console.error('Error generating response:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: `I saw your gesture: ${gesture.replace('_', ' ')}. I'm having trouble processing that right now. Could you try a different gesture?`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);

            setTimeout(() => {
                speakText(errorMessage.content);
            }, 500);
        } finally {
            setIsProcessing(false);
            setIsLoading(false);
        }
    };

    const handleInput = async (content: string, type: 'text' | 'voice' | 'gesture' = 'text') => {
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

        onSendMessage?.(content, type);

        try {
            let botReply = '';

            if (generateBotReply) {
                console.log('Calling webhook generateBotReply...');
                try {
                    const webhookReply = await generateBotReply(content, type);
                    console.log('Webhook reply received:', webhookReply);

                    if (webhookReply && webhookReply.trim()) {
                        botReply = webhookReply.trim();
                        console.log('Using webhook response:', botReply);
                    } else {
                        throw new Error('Empty webhook response');
                    }
                } catch (webhookError) {
                    console.log('Webhook failed, falling back to Gemini:', webhookError);
                    const prompt = `You are a helpful AI gesture recognition assistant. User language: ${language}. 
                    
                    Provide helpful, educational responses focused on gesture recognition, sign language, and non-verbal communication. Be encouraging and supportive. Keep responses concise but informative and suitable for voice output.
                    
                    User question: ${content}`;
                    botReply = await generateGeminiReply(prompt, language);
                    console.log('Using Gemini fallback response:', botReply);
                }
            } else {
                console.log('Using Gemini API directly...');
                const prompt = `You are a helpful AI gesture recognition assistant. User language: ${language}. 
                
                Provide helpful, educational responses focused on gesture recognition, sign language, and non-verbal communication. Be encouraging and supportive. Keep responses concise but informative and suitable for voice output.
                
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

            setTimeout(() => {
                speakText(botReply);
            }, 500);

        } catch (error) {
            console.error('Error generating response:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: `I understand you said: "${content}". I'm having trouble processing that right now. Could you please try again or rephrase your question?`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);

            setTimeout(() => {
                speakText(errorMessage.content);
            }, 500);
        } finally {
            setIsProcessing(false);
            setIsLoading(false);
        }
    };

    const handleTextSubmit = async () => {
        if (!inputValue.trim()) return;
        await handleInput(inputValue, 'text');
        setInputValue('');
    };

    const startCamera = async () => {
        try {
            console.log('Requesting camera access...');
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

                // Wait for video to be ready
                videoRef.current.onloadedmetadata = () => {
                    console.log('Video metadata loaded');
                    videoRef.current?.play().then(() => {
                        console.log('Video started playing');
                        setIsCameraOn(true);

                        // Start processing frames after video is playing
                        const processFrameLoop = () => {
                            if (isCameraOn && videoRef.current && videoRef.current.readyState >= 2) {
                                processFrame();
                                animationRef.current = requestAnimationFrame(processFrameLoop);
                            }
                        };
                        processFrameLoop();
                    }).catch(err => {
                        console.error('Error playing video:', err);
                    });
                };
            }

        } catch (error) {
            console.error('Error accessing camera:', error);
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
        setCurrentExpression('');
        setGestureConfidence(0);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Add initial greeting
    useEffect(() => {
        const greetingMessage: Message = {
            id: '1',
            type: 'bot',
            content: currentResponses.greeting + " I can see your gestures and expressions. Try waving, giving a thumbs up, or making different expressions!",
            timestamp: new Date(),
        };
        setMessages([greetingMessage]);

        setTimeout(() => {
            speakText(greetingMessage.content);
        }, 1000);
    }, []);

    return (
        <div className="flex flex-col h-full max-h-[600px]">
            {/* Gesture Assistant Header */}
            <Card className="card-adaptive p-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-coral to-coral-deep p-2 rounded-xl">
                        <Hand className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="font-semibold">Gesture Recognition Assistant</h2>
                        <p className="text-sm text-muted-foreground">
                            I can see your gestures and expressions
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
                        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            Expression: {currentExpression}
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
                                    {currentResponses.processing}
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

                {/* Camera Controls */}
                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant={isCameraOn ? "destructive" : "default"}
                        size="lg"
                        onClick={isCameraOn ? stopCamera : startCamera}
                        className={`${isCameraOn
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                            : 'bg-gradient-primary hover:scale-105'
                            } transition-all duration-300`}
                        disabled={isProcessing || isLoading}
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

                    {/* Test Buttons */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInput("Test gesture recognition", 'text')}
                        className="hover:scale-105"
                        disabled={isProcessing || isLoading}
                    >
                        Test
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => speakText("Hello! This is a test of the text to speech feature for gesture recognition. Can you hear me?")}
                        className="hover:scale-105"
                        disabled={!isTtsEnabled}
                    >
                        Test Voice
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGestureInput(GESTURE_STATES.THUMBS_UP, 0.8)}
                        className="hover:scale-105"
                        disabled={isProcessing || isLoading}
                    >
                        Test Gesture
                    </Button>
                </div>

                <div className="text-center text-xs text-muted-foreground mt-2 space-y-1">
                    <p>
                        {isCameraOn
                            ? 'Camera is on - try gestures like thumbs up, peace sign, or waving!'
                            : 'Start the camera to use gesture recognition, or type a message'
                        }
                    </p>
                    {isCameraOn && (
                        <div className="flex justify-center gap-4 text-xs">
                            <span className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${currentGesture !== GESTURE_STATES.NONE ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                Detection: {currentGesture !== GESTURE_STATES.NONE ? 'Active' : 'Waiting'}
                            </span>
                            <span className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${gestureConfidence > 0.3 ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                                Confidence: {Math.round(gestureConfidence * 100)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

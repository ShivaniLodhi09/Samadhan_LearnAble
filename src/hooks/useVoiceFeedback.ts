import { useCallback, useRef, useState } from 'react';

interface VoiceFeedbackOptions {
    language?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    delay?: number;
    emotionalTone?: 'supportive' | 'neutral' | 'encouraging';
}

interface TouchEvent {
    touches: TouchList;
    timeStamp: number;
}

interface MouseEvent {
    timeStamp: number;
}

export const useVoiceFeedback = (options: VoiceFeedbackOptions = {}) => {
    const {
        language = 'en-US',
        rate = 0.9,
        pitch = 1.0,
        volume = 0.8,
        delay = 100,
        emotionalTone = 'supportive'
    } = options;

    const [isEnabled, setIsEnabled] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const lastAnnouncementRef = useRef<string>('');
    const lastAnnouncementTimeRef = useRef<number>(0);
    const touchStartTimeRef = useRef<number>(0);
    const touchCountRef = useRef<number>(0);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const doubleTapTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Emotional tone adjustments for voice announcements
    const getEmotionalTone = useCallback((text: string): string => {
        const emotionalPrefixes = {
            supportive: "Here's ",
            neutral: "",
            encouraging: "Great! Here's "
        };

        const prefix = emotionalPrefixes[emotionalTone];
        return `${prefix}${text}`;
    }, [emotionalTone]);

    // Enhanced TTS function with better error handling and emotional tone
    const speakText = useCallback((text: string, forceRepeat = false) => {
        if (!isEnabled || !text) {
            console.log('Voice feedback disabled or no text:', { isEnabled, text });
            return;
        }

        // Prevent rapid repeated announcements unless forced
        const now = Date.now();
        if (!forceRepeat &&
            lastAnnouncementRef.current === text &&
            now - lastAnnouncementTimeRef.current < 1000) {
            console.log('Skipping duplicate announcement');
            return;
        }

        console.log('Speaking navigation feedback:', text);

        try {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                const synth = window.speechSynthesis;

                // Cancel any ongoing speech
                synth.cancel();

                // Wait for cancel to complete
                setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(getEmotionalTone(text));
                    utterance.lang = language;
                    utterance.rate = rate;
                    utterance.pitch = pitch;
                    utterance.volume = volume;

                    // Add event listeners
                    utterance.onstart = () => {
                        console.log('Navigation voice feedback started:', text);
                        setIsSpeaking(true);
                    };

                    utterance.onend = () => {
                        console.log('Navigation voice feedback ended:', text);
                        setIsSpeaking(false);
                    };

                    utterance.onerror = (event) => {
                        console.error('Navigation voice feedback error:', event.error);
                        setIsSpeaking(false);
                    };

                    synth.speak(utterance);

                    // Update tracking
                    lastAnnouncementRef.current = text;
                    lastAnnouncementTimeRef.current = now;
                }, delay);
            } else {
                console.warn('Speech synthesis not supported in this browser');
            }
        } catch (error) {
            console.error('Navigation voice feedback error:', error);
        }
    }, [isEnabled, text, language, rate, pitch, volume, delay, getEmotionalTone]);

    // Handle mouse hover events
    const handleMouseEnter = useCallback((label: string, description?: string) => {
        const announcement = description ? `${label}, ${description}` : label;
        speakText(announcement);
    }, [speakText]);

    // Handle focus events (keyboard navigation)
    const handleFocus = useCallback((label: string, description?: string) => {
        const announcement = description ? `${label}, ${description}` : label;
        speakText(announcement);
    }, [speakText]);

    // Handle touch start for long press detection
    const handleTouchStart = useCallback((label: string, description?: string) => {
        touchStartTimeRef.current = Date.now();
        touchCountRef.current = 0;

        // Clear any existing timers
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
        }
        if (doubleTapTimerRef.current) {
            clearTimeout(doubleTapTimerRef.current);
        }

        // Set up long press timer (800ms)
        longPressTimerRef.current = setTimeout(() => {
            const announcement = description ? `${label}, ${description}` : label;
            speakText(announcement, true); // Force repeat for long press
        }, 800);
    }, [speakText]);

    // Handle touch end for double tap detection
    const handleTouchEnd = useCallback((label: string, description?: string) => {
        const touchDuration = Date.now() - touchStartTimeRef.current;

        // Clear long press timer if touch ended quickly
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }

        // If it was a quick tap (less than 300ms), count it for double tap
        if (touchDuration < 300) {
            touchCountRef.current++;

            // Clear previous double tap timer
            if (doubleTapTimerRef.current) {
                clearTimeout(doubleTapTimerRef.current);
            }

            // Set up double tap timer
            doubleTapTimerRef.current = setTimeout(() => {
                if (touchCountRef.current === 2) {
                    // Double tap detected
                    const announcement = description ? `${label}, ${description}` : label;
                    speakText(announcement, true); // Force repeat for double tap
                } else if (touchCountRef.current === 1) {
                    // Single tap - normal announcement
                    const announcement = description ? `${label}, ${description}` : label;
                    speakText(announcement);
                }
                touchCountRef.current = 0;
            }, 300);
        }
    }, [speakText]);

    // Handle mouse click (for immediate feedback)
    const handleClick = useCallback((label: string, description?: string) => {
        const announcement = description ? `${label}, ${description}` : label;
        speakText(announcement);
    }, [speakText]);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
        }
        if (doubleTapTimerRef.current) {
            clearTimeout(doubleTapTimerRef.current);
        }
    }, []);

    return {
        isEnabled,
        isSpeaking,
        setIsEnabled,
        speakText,
        handleMouseEnter,
        handleFocus,
        handleTouchStart,
        handleTouchEnd,
        handleClick,
        cleanup
    };
};



import React, { createContext, useContext, useState, useEffect } from 'react';
import { useVoiceFeedback } from '@/hooks/useVoiceFeedback';

interface VoiceFeedbackContextType {
    isEnabled: boolean;
    setIsEnabled: (enabled: boolean) => void;
    isSpeaking: boolean;
    language: string;
    setLanguage: (language: string) => void;
    announce: (text: string, description?: string, forceRepeat?: boolean) => void;
    announceNavigation: (label: string, description?: string) => void;
    announceAction: (action: string, description?: string) => void;
    announceError: (error: string) => void;
    announceSuccess: (message: string) => void;
}

const VoiceFeedbackContext = createContext<VoiceFeedbackContextType | undefined>(undefined);

interface VoiceFeedbackProviderProps {
    children: React.ReactNode;
    language?: string;
}

export const VoiceFeedbackProvider: React.FC<VoiceFeedbackProviderProps> = ({
    children,
    language: initialLanguage = 'en-US'
}) => {
    const [language, setLanguage] = useState(initialLanguage);
    const voiceFeedback = useVoiceFeedback({
        language: language === 'hi' ? 'hi-IN' : 'en-US',
        emotionalTone: 'supportive'
    });

    // Update voice feedback language when context language changes
    useEffect(() => {
        // The useVoiceFeedback hook will automatically use the new language
    }, [language]);

    const announce = (text: string, description?: string, forceRepeat = false) => {
        if (description) {
            voiceFeedback.speakText(`${text}, ${description}`, forceRepeat);
        } else {
            voiceFeedback.speakText(text, forceRepeat);
        }
    };

    const announceNavigation = (label: string, description?: string) => {
        announce(label, description);
    };

    const announceAction = (action: string, description?: string) => {
        announce(action, description);
    };

    const announceError = (error: string) => {
        announce(`Error: ${error}`);
    };

    const announceSuccess = (message: string) => {
        announce(`Success: ${message}`);
    };

    const value: VoiceFeedbackContextType = {
        isEnabled: voiceFeedback.isEnabled,
        setIsEnabled: voiceFeedback.setIsEnabled,
        isSpeaking: voiceFeedback.isSpeaking,
        language,
        setLanguage,
        announce,
        announceNavigation,
        announceAction,
        announceError,
        announceSuccess
    };

    return (
        <VoiceFeedbackContext.Provider value={value}>
            {children}
        </VoiceFeedbackContext.Provider>
    );
};

export const useVoiceFeedbackContext = (): VoiceFeedbackContextType => {
    const context = useContext(VoiceFeedbackContext);
    if (context === undefined) {
        throw new Error('useVoiceFeedbackContext must be used within a VoiceFeedbackProvider');
    }
    return context;
};



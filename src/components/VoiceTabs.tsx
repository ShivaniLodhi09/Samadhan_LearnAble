import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useVoiceFeedback } from '@/hooks/useVoiceFeedback';

interface VoiceTabsProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    language?: string;
    className?: string;
}

interface VoiceTabsListProps {
    children: React.ReactNode;
    className?: string;
}

interface VoiceTabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    voiceLabel?: string;
    voiceDescription?: string;
}

interface VoiceTabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export const VoiceTabs: React.FC<VoiceTabsProps> = ({
    value,
    onValueChange,
    children,
    language = 'en-US',
    className
}) => {
    return (
        <Tabs value={value} onValueChange={onValueChange} className={className}>
            {children}
        </Tabs>
    );
};

export const VoiceTabsList: React.FC<VoiceTabsListProps> = ({
    children,
    className
}) => {
    return (
        <TabsList className={className} role="tablist">
            {children}
        </TabsList>
    );
};

export const VoiceTabsTrigger: React.FC<VoiceTabsTriggerProps> = ({
    value,
    children,
    className,
    voiceLabel,
    voiceDescription
}) => {
    const voiceFeedback = useVoiceFeedback({
        language: 'en-US',
        emotionalTone: 'supportive'
    });

    const announcementLabel = voiceLabel || (typeof children === 'string' ? children : 'Tab');

    const handleMouseEnter = () => {
        voiceFeedback.handleMouseEnter(announcementLabel, voiceDescription);
    };

    const handleFocus = () => {
        voiceFeedback.handleFocus(announcementLabel, voiceDescription);
    };

    const handleTouchStart = () => {
        voiceFeedback.handleTouchStart(announcementLabel, voiceDescription);
    };

    const handleTouchEnd = () => {
        voiceFeedback.handleTouchEnd(announcementLabel, voiceDescription);
    };

    return (
        <TabsTrigger
            value={value}
            className={className}
            onMouseEnter={handleMouseEnter}
            onFocus={handleFocus}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="tab"
            aria-label={announcementLabel}
        >
            {children}
        </TabsTrigger>
    );
};

export const VoiceTabsContent: React.FC<VoiceTabsContentProps> = ({
    value,
    children,
    className
}) => {
    return (
        <TabsContent value={value} className={className} role="tabpanel">
            {children}
        </TabsContent>
    );
};



import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useVoiceFeedbackContext } from '@/contexts/VoiceFeedbackContext';

interface VoiceButtonProps extends ButtonProps {
    voiceLabel?: string;
    voiceDescription?: string;
    language?: string;
    enableVoiceFeedback?: boolean;
}

export const VoiceButton = forwardRef<HTMLButtonElement, VoiceButtonProps>(
    ({
        voiceLabel,
        voiceDescription,
        language = 'en-US',
        enableVoiceFeedback = true,
        onMouseEnter,
        onFocus,
        onClick,
        children,
        ...props
    }, ref) => {
        const { announceNavigation, announceAction, isEnabled } = useVoiceFeedbackContext();

        const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
            if (enableVoiceFeedback && isEnabled && voiceLabel) {
                const announcement = voiceDescription ? `${voiceLabel}, ${voiceDescription}` : voiceLabel;
                announceNavigation(announcement);
            }
            onMouseEnter?.(event);
        };

        const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
            if (enableVoiceFeedback && isEnabled && voiceLabel) {
                const announcement = voiceDescription ? `${voiceLabel}, ${voiceDescription}` : voiceLabel;
                announceNavigation(announcement);
            }
            onFocus?.(event);
        };

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            if (enableVoiceFeedback && isEnabled && voiceLabel) {
                announceAction(`Clicked ${voiceLabel}`);
            }
            onClick?.(event);
        };

        return (
            <Button
                ref={ref}
                {...props}
                onMouseEnter={handleMouseEnter}
                onFocus={handleFocus}
                onClick={handleClick}
                aria-label={props['aria-label'] || voiceLabel || (typeof children === 'string' ? children : 'Button')}
                aria-describedby={props['aria-describedby'] || (voiceDescription ? `${props.id || 'button'}-description` : undefined)}
            >
                {children}
                {voiceDescription && (
                    <span
                        id={`${props.id || 'button'}-description`}
                        className="sr-only"
                    >
                        {voiceDescription}
                    </span>
                )}
            </Button>
        );
    }
);

VoiceButton.displayName = 'VoiceButton';


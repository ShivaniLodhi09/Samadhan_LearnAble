import React, { forwardRef, useState, useEffect } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useVoiceFeedbackContext } from '@/contexts/VoiceFeedbackContext';

interface BlindAccessibleButtonProps extends ButtonProps {
    voiceLabel?: string;
    voiceDescription?: string;
    contextInfo?: string;
    currentState?: string;
    actionResult?: string;
    language?: string;
    enableVoiceFeedback?: boolean;
    announceOnMount?: boolean;
    announceStateChanges?: boolean;
}

export const BlindAccessibleButton = forwardRef<HTMLButtonElement, BlindAccessibleButtonProps>(
    ({
        voiceLabel,
        voiceDescription,
        contextInfo,
        currentState,
        actionResult,
        language = 'en-US',
        enableVoiceFeedback = true,
        announceOnMount = false,
        announceStateChanges = true,
        onMouseEnter,
        onFocus,
        onTouchStart,
        onTouchEnd,
        onClick,
        children,
        ...props
    }, ref) => {
        const { announce, announceAction, isEnabled } = useVoiceFeedbackContext();
        const [isPressed, setIsPressed] = useState(false);
        const [isHovered, setIsHovered] = useState(false);
        const [isFocused, setIsFocused] = useState(false);

        // Enhanced announcement text with context
        const getEnhancedAnnouncement = () => {
            let announcement = voiceLabel || (typeof children === 'string' ? children : '') || props['aria-label'] || 'Button';

            if (voiceDescription) {
                announcement += `, ${voiceDescription}`;
            }

            if (contextInfo) {
                announcement += `, ${contextInfo}`;
            }

            if (currentState) {
                announcement += `, currently ${currentState}`;
            }

            if (isPressed) {
                announcement += ', pressed';
            }

            if (isHovered) {
                announcement += ', hovered';
            }

            if (isFocused) {
                announcement += ', focused';
            }

            return announcement;
        };

        // Announce on mount if enabled
        useEffect(() => {
            if (announceOnMount && enableVoiceFeedback && isEnabled) {
                const timer = setTimeout(() => {
                    announce(getEnhancedAnnouncement());
                }, 100);
                return () => clearTimeout(timer);
            }
        }, [announceOnMount, enableVoiceFeedback, isEnabled, announce]);

        // Announce state changes
        useEffect(() => {
            if (announceStateChanges && enableVoiceFeedback && isEnabled) {
                if (isPressed) {
                    announce(`${voiceLabel || 'Button'} pressed`);
                }
            }
        }, [isPressed, announceStateChanges, enableVoiceFeedback, isEnabled, announce, voiceLabel]);

        const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
            setIsHovered(true);
            if (enableVoiceFeedback && isEnabled) {
                announce(getEnhancedAnnouncement());
            }
            onMouseEnter?.(event);
        };

        const handleMouseLeave = () => {
            setIsHovered(false);
        };

        const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
            setIsFocused(true);
            if (enableVoiceFeedback && isEnabled) {
                announce(getEnhancedAnnouncement());
            }
            onFocus?.(event);
        };

        const handleBlur = () => {
            setIsFocused(false);
        };

        const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
            if (enableVoiceFeedback && isEnabled) {
                announce(getEnhancedAnnouncement());
            }
            onTouchStart?.(event);
        };

        const handleTouchEnd = (event: React.TouchEvent<HTMLButtonElement>) => {
            onTouchEnd?.(event);
        };

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            setIsPressed(!isPressed);

            if (enableVoiceFeedback && isEnabled) {
                if (actionResult) {
                    announceAction(actionResult);
                } else {
                    announceAction(`${voiceLabel || 'Button'} activated`);
                }
            }

            onClick?.(event);
        };

        const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
            if (enableVoiceFeedback && isEnabled) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleClick(event as any);
                } else if (event.key === 'Escape') {
                    announce('Button cancelled');
                }
            }
        };

        return (
            <Button
                ref={ref}
                {...props}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                aria-label={props['aria-label'] || voiceLabel || (typeof children === 'string' ? children : 'Button')}
                aria-describedby={props['aria-describedby'] || (voiceDescription ? `${props.id || 'button'}-description` : undefined)}
                aria-pressed={props['aria-pressed'] || (props.variant === 'default' ? true : undefined)}
                role={props.role || 'button'}
                tabIndex={props.tabIndex || 0}
                className={`blind-accessible-button ${props.className || ''} ${isPressed ? 'pressed' : ''
                    } ${isHovered ? 'hovered' : ''} ${isFocused ? 'focused' : ''}`}
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
                {contextInfo && (
                    <span className="sr-only">
                        {contextInfo}
                    </span>
                )}
                {currentState && (
                    <span className="sr-only">
                        Current state: {currentState}
                    </span>
                )}
            </Button>
        );
    }
);

BlindAccessibleButton.displayName = 'BlindAccessibleButton';



import React, { useEffect, useRef, useState } from 'react';
import { useVoiceFeedbackContext } from '@/contexts/VoiceFeedbackContext';

interface BlindNavigationSystemProps {
    children: React.ReactNode;
}

interface NavigationLandmark {
    id: string;
    label: string;
    description: string;
    element: HTMLElement | null;
}

export const BlindNavigationSystem: React.FC<BlindNavigationSystemProps> = ({
    children
}) => {
    const { announce, announceNavigation, isEnabled } = useVoiceFeedbackContext();
    const [landmarks, setLandmarks] = useState<NavigationLandmark[]>([]);
    const [currentSection, setCurrentSection] = useState<string>('');
    const [isNavigating, setIsNavigating] = useState(false);
    const navigationRef = useRef<HTMLDivElement>(null);
    const skipLinksRef = useRef<HTMLDivElement>(null);

    // Define navigation landmarks for screen readers
    const navigationLandmarks = [
        { id: 'main-nav', label: 'Main Navigation', description: 'Primary navigation menu with Home, Learn, Progress, Chat, and Settings' },
        { id: 'main-content', label: 'Main Content', description: 'Primary content area with learning modules and interactive elements' },
        { id: 'user-actions', label: 'User Actions', description: 'User profile, settings, and logout options' },
        { id: 'voice-controls', label: 'Voice Controls', description: 'Voice feedback toggle and accessibility controls' },
        { id: 'chat-interface', label: 'Chat Interface', description: 'AI assistant chat with visual, sound, and gesture options' },
        { id: 'learning-module', label: 'Learning Module', description: 'Interactive learning content with progress tracking' },
        { id: 'progress-tracker', label: 'Progress Tracker', description: 'Your learning progress and achievements' },
        { id: 'settings', label: 'Settings', description: 'Application settings and preferences' }
    ];

    // Enhanced keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isEnabled) return;

            // Skip links navigation
            if (event.altKey && event.shiftKey) {
                switch (event.key) {
                    case '1':
                        event.preventDefault();
                        navigateToLandmark('main-nav');
                        break;
                    case '2':
                        event.preventDefault();
                        navigateToLandmark('main-content');
                        break;
                    case '3':
                        event.preventDefault();
                        navigateToLandmark('user-actions');
                        break;
                    case '4':
                        event.preventDefault();
                        navigateToLandmark('voice-controls');
                        break;
                    case '5':
                        event.preventDefault();
                        navigateToLandmark('chat-interface');
                        break;
                    case '6':
                        event.preventDefault();
                        navigateToLandmark('learning-module');
                        break;
                    case '7':
                        event.preventDefault();
                        navigateToLandmark('progress-tracker');
                        break;
                    case '8':
                        event.preventDefault();
                        navigateToLandmark('settings');
                        break;
                }
            }

            // Enhanced navigation shortcuts
            if (event.altKey) {
                switch (event.key) {
                    case 'ArrowRight':
                        event.preventDefault();
                        navigateToNextInteractive();
                        break;
                    case 'ArrowLeft':
                        event.preventDefault();
                        navigateToPreviousInteractive();
                        break;
                    case 'ArrowUp':
                        event.preventDefault();
                        navigateToPreviousSection();
                        break;
                    case 'ArrowDown':
                        event.preventDefault();
                        navigateToNextSection();
                        break;
                    case 'Home':
                        event.preventDefault();
                        navigateToLandmark('main-nav');
                        break;
                    case 'End':
                        event.preventDefault();
                        navigateToLandmark('user-actions');
                        break;
                }
            }

            // Quick help
            if (event.key === 'F1') {
                event.preventDefault();
                announceBlindNavigationHelp();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isEnabled, landmarks]);

    // Navigate to specific landmark
    const navigateToLandmark = (landmarkId: string) => {
        const landmark = landmarks.find(l => l.id === landmarkId);
        if (landmark && landmark.element) {
            landmark.element.focus();
            announceNavigation(`${landmark.label}, ${landmark.description}`);
            setCurrentSection(landmarkId);
        } else {
            // Try to find the element by ID
            const element = document.getElementById(landmarkId);
            if (element) {
                element.focus();
                const landmarkInfo = navigationLandmarks.find(l => l.id === landmarkId);
                if (landmarkInfo) {
                    announceNavigation(`${landmarkInfo.label}, ${landmarkInfo.description}`);
                    setCurrentSection(landmarkId);
                }
            }
        }
    };

    // Navigate to next interactive element
    const navigateToNextInteractive = () => {
        const interactiveElements = document.querySelectorAll(
            'button, [role="button"], a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const currentElement = document.activeElement;
        const currentIndex = Array.from(interactiveElements).indexOf(currentElement as Element);
        const nextIndex = (currentIndex + 1) % interactiveElements.length;
        const nextElement = interactiveElements[nextIndex] as HTMLElement;

        if (nextElement) {
            nextElement.focus();
            const label = nextElement.getAttribute('aria-label') ||
                nextElement.textContent?.trim() ||
                nextElement.getAttribute('alt') ||
                nextElement.tagName.toLowerCase();
            announceNavigation(`Focused on ${label}`);
        }
    };

    // Navigate to previous interactive element
    const navigateToPreviousInteractive = () => {
        const interactiveElements = document.querySelectorAll(
            'button, [role="button"], a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const currentElement = document.activeElement;
        const currentIndex = Array.from(interactiveElements).indexOf(currentElement as Element);
        const prevIndex = currentIndex <= 0 ? interactiveElements.length - 1 : currentIndex - 1;
        const prevElement = interactiveElements[prevIndex] as HTMLElement;

        if (prevElement) {
            prevElement.focus();
            const label = prevElement.getAttribute('aria-label') ||
                prevElement.textContent?.trim() ||
                prevElement.getAttribute('alt') ||
                prevElement.tagName.toLowerCase();
            announceNavigation(`Focused on ${label}`);
        }
    };

    // Navigate to next section
    const navigateToNextSection = () => {
        const currentIndex = landmarks.findIndex(l => l.id === currentSection);
        const nextIndex = (currentIndex + 1) % landmarks.length;
        const nextLandmark = landmarks[nextIndex];
        if (nextLandmark) {
            navigateToLandmark(nextLandmark.id);
        }
    };

    // Navigate to previous section
    const navigateToPreviousSection = () => {
        const currentIndex = landmarks.findIndex(l => l.id === currentSection);
        const prevIndex = currentIndex <= 0 ? landmarks.length - 1 : currentIndex - 1;
        const prevLandmark = landmarks[prevIndex];
        if (prevLandmark) {
            navigateToLandmark(prevLandmark.id);
        }
    };

    // Announce blind navigation help
    const announceBlindNavigationHelp = () => {
        const helpText = `
      Blind Navigation Help:
      Alt + Shift + 1-8: Jump to specific sections
      Alt + Arrow Keys: Navigate between elements and sections
      Alt + Home: Go to main navigation
      Alt + End: Go to user actions
      F1: Repeat this help
      Tab: Navigate to next element
      Shift + Tab: Navigate to previous element
      Space or Enter: Activate focused element
      Escape: Close dialogs or menus
    `;
        announce(helpText);
    };

    // Enhanced focus management
    useEffect(() => {
        const handleFocusIn = (event: FocusEvent) => {
            if (!isEnabled) return;

            const target = event.target as HTMLElement;
            const role = target.getAttribute('role') || target.tagName.toLowerCase();
            const label = target.getAttribute('aria-label') ||
                target.textContent?.trim() ||
                target.getAttribute('alt') ||
                'Interactive element';

            // Determine current section
            const section = target.closest('[data-section]')?.getAttribute('data-section') || 'unknown';
            if (section !== currentSection) {
                setCurrentSection(section);
                const sectionInfo = navigationLandmarks.find(l => l.id === section);
                if (sectionInfo) {
                    announce(`Now in ${sectionInfo.label} section`);
                }
            }

            // Enhanced announcements based on element type
            if (role === 'button') {
                const isPressed = target.getAttribute('aria-pressed') === 'true';
                const isExpanded = target.getAttribute('aria-expanded') === 'true';
                const state = isPressed ? 'pressed' : isExpanded ? 'expanded' : '';
                announceNavigation(`${label} button${state ? `, ${state}` : ''}`);
            } else if (role === 'link') {
                announceNavigation(`${label} link`);
            } else if (role === 'tab') {
                const isSelected = target.getAttribute('aria-selected') === 'true';
                announceNavigation(`${label} tab${isSelected ? ', selected' : ''}`);
            } else if (role === 'menuitem') {
                announceNavigation(`${label} menu item`);
            } else {
                announceNavigation(`${label}`);
            }
        };

        document.addEventListener('focusin', handleFocusIn);
        return () => document.removeEventListener('focusin', handleFocusIn);
    }, [isEnabled, currentSection, announceNavigation]);

    return (
        <div ref={navigationRef} className="blind-navigation-system">
            {/* Skip Links for Screen Readers */}
            <div ref={skipLinksRef} className="sr-only focus-within:not-sr-only">
                <h2 className="sr-only">Skip Navigation</h2>
                <a
                    href="#main-nav"
                    className="skip-link"
                    onClick={(e) => {
                        e.preventDefault();
                        navigateToLandmark('main-nav');
                    }}
                >
                    Skip to Main Navigation
                </a>
                <a
                    href="#main-content"
                    className="skip-link"
                    onClick={(e) => {
                        e.preventDefault();
                        navigateToLandmark('main-content');
                    }}
                >
                    Skip to Main Content
                </a>
                <a
                    href="#user-actions"
                    className="skip-link"
                    onClick={(e) => {
                        e.preventDefault();
                        navigateToLandmark('user-actions');
                    }}
                >
                    Skip to User Actions
                </a>
            </div>

            {/* Navigation Landmarks */}
            {navigationLandmarks.map((landmark) => (
                <div
                    key={landmark.id}
                    id={landmark.id}
                    data-section={landmark.id}
                    role="region"
                    aria-label={landmark.label}
                    aria-describedby={`${landmark.id}-description`}
                    tabIndex={-1}
                >
                    <div id={`${landmark.id}-description`} className="sr-only">
                        {landmark.description}
                    </div>
                </div>
            ))}

            {/* Main Content */}
            <div data-section="main-content">
                {children}
            </div>

            {/* Blind Navigation Instructions */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
                <div id="blind-navigation-instructions">
                    Press F1 for navigation help. Use Alt + Shift + number keys to jump to sections.
                </div>
            </div>
        </div>
    );
};



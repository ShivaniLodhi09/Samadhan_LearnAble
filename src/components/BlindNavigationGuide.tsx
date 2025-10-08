import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVoiceFeedbackContext } from '@/contexts/VoiceFeedbackContext';
import {
    Navigation,
    MousePointer,
    Keyboard,
    Volume2,
    Eye,
    Hand,
    HelpCircle,
    ArrowRight,
    ArrowLeft,
    ArrowUp,
    ArrowDown,
    Home,
    End
} from 'lucide-react';

interface NavigationGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BlindNavigationGuide: React.FC<NavigationGuideProps> = ({
    isOpen,
    onClose
}) => {
    const { announce, isEnabled } = useVoiceFeedbackContext();
    const [currentSection, setCurrentSection] = useState(0);

    const navigationSections = [
        {
            id: 'basic',
            title: 'Basic Navigation',
            icon: Navigation,
            content: [
                { key: 'Tab', description: 'Move to next interactive element' },
                { key: 'Shift + Tab', description: 'Move to previous interactive element' },
                { key: 'Enter', description: 'Activate focused button or link' },
                { key: 'Space', description: 'Activate focused button' },
                { key: 'Escape', description: 'Close dialogs or cancel actions' },
                { key: 'F1', description: 'Show this navigation help' }
            ]
        },
        {
            id: 'advanced',
            title: 'Advanced Navigation',
            icon: Keyboard,
            content: [
                { key: 'Alt + Shift + 1', description: 'Jump to Main Navigation' },
                { key: 'Alt + Shift + 2', description: 'Jump to Main Content' },
                { key: 'Alt + Shift + 3', description: 'Jump to User Actions' },
                { key: 'Alt + Shift + 4', description: 'Jump to Voice Controls' },
                { key: 'Alt + Shift + 5', description: 'Jump to Chat Interface' },
                { key: 'Alt + Shift + 6', description: 'Jump to Learning Module' },
                { key: 'Alt + Shift + 7', description: 'Jump to Progress Tracker' },
                { key: 'Alt + Shift + 8', description: 'Jump to Settings' }
            ]
        },
        {
            id: 'directional',
            title: 'Directional Navigation',
            icon: ArrowRight,
            content: [
                { key: 'Alt + →', description: 'Move to next interactive element' },
                { key: 'Alt + ←', description: 'Move to previous interactive element' },
                { key: 'Alt + ↑', description: 'Move to previous section' },
                { key: 'Alt + ↓', description: 'Move to next section' },
                { key: 'Alt + Home', description: 'Go to main navigation' },
                { key: 'Alt + End', description: 'Go to user actions' }
            ]
        },
        {
            id: 'voice',
            title: 'Voice Features',
            icon: Volume2,
            content: [
                { key: 'Hover', description: 'Hover over any element to hear its description' },
                { key: 'Focus', description: 'Focus on elements to hear detailed information' },
                { key: 'Long Press', description: 'Long press (800ms) to repeat announcements' },
                { key: 'Double Tap', description: 'Double tap to repeat announcements' },
                { key: 'Voice Toggle', description: 'Use volume button in navigation to toggle voice' },
                { key: 'Language', description: 'Voice automatically adapts to your language setting' }
            ]
        },
        {
            id: 'touch',
            title: 'Touch Navigation',
            icon: Hand,
            content: [
                { key: 'Single Tap', description: 'Activate element and hear confirmation' },
                { key: 'Long Press', description: 'Repeat voice announcement (800ms)' },
                { key: 'Double Tap', description: 'Repeat voice announcement' },
                { key: 'Swipe', description: 'Navigate between sections (if supported)' },
                { key: 'Pinch', description: 'Zoom in/out for better visibility' },
                { key: 'Voice Over', description: 'Works with screen readers like VoiceOver' }
            ]
        },
        {
            id: 'accessibility',
            title: 'Accessibility Features',
            icon: Eye,
            content: [
                { key: 'ARIA Labels', description: 'All elements have descriptive labels' },
                { key: 'Semantic HTML', description: 'Proper HTML structure for screen readers' },
                { key: 'Focus Indicators', description: 'Clear visual focus indicators' },
                { key: 'Skip Links', description: 'Skip to main content and navigation' },
                { key: 'High Contrast', description: 'Toggle high contrast mode in settings' },
                { key: 'Screen Reader', description: 'Optimized for NVDA, JAWS, and VoiceOver' }
            ]
        }
    ];

    const currentSectionData = navigationSections[currentSection];

    useEffect(() => {
        if (isOpen && isEnabled) {
            announce(`Navigation guide opened. ${currentSectionData.title} section. Use arrow keys to navigate between sections.`);
        }
    }, [isOpen, currentSection, isEnabled, announce, currentSectionData]);

    const handleSectionChange = (direction: 'next' | 'prev') => {
        const newSection = direction === 'next'
            ? (currentSection + 1) % navigationSections.length
            : currentSection === 0 ? navigationSections.length - 1 : currentSection - 1;

        setCurrentSection(newSection);

        if (isEnabled) {
            announce(`${navigationSections[newSection].title} section`);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            handleSectionChange('next');
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            handleSectionChange('prev');
        } else if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            role="dialog"
            aria-labelledby="navigation-guide-title"
            aria-describedby="navigation-guide-description"
        >
            <Card
                className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
                onKeyDown={handleKeyDown}
                tabIndex={-1}
            >
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <HelpCircle className="h-6 w-6 text-primary" />
                            <h2 id="navigation-guide-title" className="text-2xl font-bold">
                                Blind Navigation Guide
                            </h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            aria-label="Close navigation guide"
                        >
                            ✕
                        </Button>
                    </div>

                    <p id="navigation-guide-description" className="text-muted-foreground mb-6">
                        Comprehensive guide for navigating LearnAble using keyboard, voice, and touch.
                    </p>

                    {/* Section Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSectionChange('prev')}
                            aria-label="Previous section"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-2">
                            <currentSectionData.icon className="h-5 w-5" />
                            <span className="font-medium">{currentSectionData.title}</span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSectionChange('next')}
                            aria-label="Next section"
                        >
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>

                    {/* Section Content */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">{currentSectionData.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentSectionData.content.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                                    onFocus={() => isEnabled && announce(`${item.key}, ${item.description}`)}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`${item.key}, ${item.description}`}
                                >
                                    <kbd className="px-3 py-1 bg-background border rounded text-sm font-mono min-w-[120px]">
                                        {item.key}
                                    </kbd>
                                    <span className="text-sm text-muted-foreground ml-4">
                                        {item.description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section Indicators */}
                    <div className="flex justify-center gap-2 mt-6">
                        {navigationSections.map((_, index) => (
                            <button
                                key={index}
                                className={`w-3 h-3 rounded-full ${index === currentSection ? 'bg-primary' : 'bg-muted'
                                    }`}
                                onClick={() => setCurrentSection(index)}
                                aria-label={`Go to section ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Quick Tips */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Quick Tips for Blind Users:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Use Tab to navigate through all interactive elements</li>
                            <li>• Press F1 anytime to hear this guide</li>
                            <li>• Long-press or double-tap any element to repeat its description</li>
                            <li>• Use Alt + Shift + number keys to jump to specific sections</li>
                            <li>• Voice feedback automatically announces your current location</li>
                            <li>• All buttons and links have descriptive labels and context</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};



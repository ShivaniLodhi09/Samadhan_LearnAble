import React, { useEffect } from 'react';
import { useVoiceFeedbackContext } from '@/contexts/VoiceFeedbackContext';

interface AccessibilityEnhancementsProps {
    children: React.ReactNode;
}

export const AccessibilityEnhancements: React.FC<AccessibilityEnhancementsProps> = ({
    children
}) => {
    const { announce, isEnabled } = useVoiceFeedbackContext();

    useEffect(() => {
        // Announce page changes and important updates
        const handlePageChange = () => {
            if (isEnabled) {
                const pageTitle = document.title;
                const mainHeading = document.querySelector('h1, h2, [role="main"] h1, [role="main"] h2');
                const headingText = mainHeading?.textContent || pageTitle;

                // Small delay to ensure page is fully loaded
                setTimeout(() => {
                    announce(`Page loaded: ${headingText}`);
                }, 500);
            }
        };

        // Announce focus changes for better navigation
        const handleFocusChange = (event: FocusEvent) => {
            if (isEnabled && event.target) {
                const target = event.target as HTMLElement;
                const label = target.getAttribute('aria-label') ||
                    target.textContent?.trim() ||
                    target.getAttribute('alt') ||
                    'Interactive element';

                const role = target.getAttribute('role') || target.tagName.toLowerCase();
                const description = target.getAttribute('aria-describedby') ?
                    document.getElementById(target.getAttribute('aria-describedby')!)?.textContent :
                    undefined;

                if (role === 'button' || role === 'link' || role === 'menuitem' || role === 'tab') {
                    announce(`Focused on ${label}`, description);
                }
            }
        };

        // Announce keyboard shortcuts
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isEnabled && event.altKey) {
                switch (event.key) {
                    case 'h':
                        event.preventDefault();
                        announce('Keyboard shortcut: Alt+H for help');
                        break;
                    case 'n':
                        event.preventDefault();
                        announce('Keyboard shortcut: Alt+N for navigation');
                        break;
                    case 's':
                        event.preventDefault();
                        announce('Keyboard shortcut: Alt+S for settings');
                        break;
                    case 'v':
                        event.preventDefault();
                        announce('Keyboard shortcut: Alt+V to toggle voice feedback');
                        break;
                }
            }
        };

        // Add event listeners
        window.addEventListener('load', handlePageChange);
        document.addEventListener('focusin', handleFocusChange);
        document.addEventListener('keydown', handleKeyDown);

        // Initial announcement
        handlePageChange();

        return () => {
            window.removeEventListener('load', handlePageChange);
            document.removeEventListener('focusin', handleFocusChange);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [announce, isEnabled]);

    return <>{children}</>;
};

// Keyboard shortcuts help component
export const KeyboardShortcutsHelp: React.FC = () => {
    const { announce } = useVoiceFeedbackContext();

    const shortcuts = [
        { key: 'Alt + H', description: 'Show help and keyboard shortcuts' },
        { key: 'Alt + N', description: 'Focus on main navigation' },
        { key: 'Alt + S', description: 'Open settings' },
        { key: 'Alt + V', description: 'Toggle voice feedback on/off' },
        { key: 'Tab', description: 'Navigate to next interactive element' },
        { key: 'Shift + Tab', description: 'Navigate to previous interactive element' },
        { key: 'Enter', description: 'Activate focused button or link' },
        { key: 'Space', description: 'Activate focused button' },
        { key: 'Escape', description: 'Close dialogs or menus' },
    ];

    const handleShortcutFocus = (shortcut: typeof shortcuts[0]) => {
        announce(`Keyboard shortcut: ${shortcut.key}, ${shortcut.description}`);
    };

    return (
        <div className="space-y-2">
            <h3 className="font-semibold">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {shortcuts.map((shortcut, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-muted rounded-lg"
                        onFocus={() => handleShortcutFocus(shortcut)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Keyboard shortcut: ${shortcut.key}, ${shortcut.description}`}
                    >
                        <kbd className="px-2 py-1 bg-background border rounded text-sm font-mono">
                            {shortcut.key}
                        </kbd>
                        <span className="text-sm text-muted-foreground">
                            {shortcut.description}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};



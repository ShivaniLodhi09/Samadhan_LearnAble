import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Home,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Settings,
  User,
  LogOut,
  Accessibility
} from 'lucide-react';
import { useVoiceFeedbackContext } from '@/contexts/VoiceFeedbackContext';

interface NavigationBarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout?: () => void;
  highContrast: boolean;
  onToggleContrast: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentView,
  onViewChange,
  onLogout,
  highContrast,
  onToggleContrast,
}) => {
  const { announceNavigation, announceAction } = useVoiceFeedbackContext();

  const navItems = [
    { id: 'welcome', icon: Home, label: 'Home', description: 'Go to home page' },
    { id: 'learning', icon: BookOpen, label: 'Learn', description: 'Start learning new topics' },
    { id: 'progress', icon: TrendingUp, label: 'Progress', description: 'View your learning progress' },
    { id: 'chat', icon: MessageCircle, label: 'Chat', description: 'Chat with AI assistant' },
    { id: 'settings', icon: Settings, label: 'Settings', description: 'Access application settings' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    announceAction(`Navigating to ${item.label}`);
    onViewChange(item.id);
  };

  const handleNavHover = (item: typeof navItems[0]) => {
    announceNavigation(item.label, item.description);
  };

  const handleNavFocus = (item: typeof navItems[0]) => {
    announceNavigation(item.label, item.description);
  };

  const handleUserActionClick = (action: string, description: string) => {
    announceAction(`${action}: ${description}`);
  };

  const handleUserActionHover = (action: string, description: string) => {
    announceNavigation(action, description);
  };

  const handleUserActionFocus = (action: string, description: string) => {
    announceNavigation(action, description);
  };

  return (
    <nav className={`bg-card border-b border-border shadow-lg ${highContrast ? 'high-contrast' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-lavender to-mint p-2 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">LearnAble</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? "default" : "ghost"}
                size="sm"
                className={`flex items-center gap-2 transition-all duration-300 ${currentView === item.id
                  ? 'bg-gradient-primary scale-105'
                  : 'hover:scale-102'
                  }`}
                onClick={() => handleNavClick(item)}
                onMouseEnter={() => handleNavHover(item)}
                onFocus={() => handleNavFocus(item)}
                aria-label={`${item.label}, ${item.description}`}
                aria-describedby={`nav-${item.id}-desc`}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                <span id={`nav-${item.id}-desc`} className="sr-only">{item.description}</span>
              </Button>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleUserActionClick("Toggle high contrast", "Switch between normal and high contrast mode");
                onToggleContrast();
              }}
              onMouseEnter={() => handleUserActionHover("Toggle high contrast", "Switch between normal and high contrast mode")}
              onFocus={() => handleUserActionFocus("Toggle high contrast", "Switch between normal and high contrast mode")}
              aria-label="Toggle high contrast mode"
              className="hover:scale-105 transition-all duration-300"
            >
              <Accessibility className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="hover:scale-105 transition-all duration-300"
              onMouseEnter={() => handleUserActionHover("User profile", "View and manage your profile")}
              onFocus={() => handleUserActionFocus("User profile", "View and manage your profile")}
              aria-label="User profile"
            >
              <User className="h-4 w-4" />
            </Button>

            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleUserActionClick("Logout", "Sign out of your account");
                  onLogout();
                }}
                onMouseEnter={() => handleUserActionHover("Logout", "Sign out of your account")}
                onFocus={() => handleUserActionFocus("Logout", "Sign out of your account")}
                className="hover:scale-105 transition-all duration-300 text-destructive hover:text-destructive"
                aria-label="Logout from account"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
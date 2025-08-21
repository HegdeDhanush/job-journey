import React from 'react';
import { BrandLogo } from './BrandLogo';
import { Button } from '@/components/ui/button';
import { Moon, Sun, User } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface CustomHeaderProps {
  onProfileClick?: () => void;
  onSignOut?: () => void;
  userEmail?: string;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
  onProfileClick,
  onSignOut,
  userEmail
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-4">
          <BrandLogo size="md" />
          <div className="hidden md:block">
            <div className="text-sm text-muted-foreground">
              AI-Powered Placement Tracking
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          {userEmail && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onProfileClick}
                className="h-9 px-3 rounded-lg"
              >
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline-block">Profile</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onSignOut}
                className="h-9 px-3 rounded-lg border-primary/20 hover:bg-primary/10"
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CustomHeader;

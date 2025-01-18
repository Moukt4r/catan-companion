import React from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';

interface HeaderProps {
  title?: string;
  className?: string;
  onMenuClick?: () => void;
  navigationMenu?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'Catan Companion',
  className = '',
  onMenuClick,
  navigationMenu
}) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-800 ${className}`}
      role="banner"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          {navigationMenu}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};
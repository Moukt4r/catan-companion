import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Header } from '../Header';
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes');

// Mock lucide-react components
jest.mock('lucide-react', () => ({
  Sun: () => <span data-testid="sun-icon">Sun</span>,
  Moon: () => <span data-testid="moon-icon">Moon</span>,
  Menu: () => <span data-testid="menu-icon">Menu</span>,
}));

describe('Header', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
    
    // Mock useTheme implementation
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      systemTheme: 'light'
    });
  });

  it('renders the default title', () => {
    render(<Header />);
    expect(screen.getByText('Catan Companion')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('bg-white');
  });

  it('renders a custom title when provided', () => {
    render(<Header title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(<Header className="custom-class" />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('custom-class');
  });

  it('toggles theme when theme button is clicked', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      systemTheme: 'light'
    });
    
    render(<Header />);
    
    // Verify initial moon icon is shown for light theme
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    
    // Click theme toggle
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(themeToggle);
    
    // Verify setTheme was called with dark
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('shows appropriate icon based on current theme', () => {
    // Test light theme
    render(<Header />);
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    
    // Cleanup after first render
    cleanup();
    
    // Test dark theme
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      systemTheme: 'dark'
    });
    
    render(<Header />);
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });

  it('renders menu button for mobile view', () => {
    render(<Header />);
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  });

  it('handles menu click', () => {
    const onMenuClick = jest.fn();
    render(<Header onMenuClick={onMenuClick} />);
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    
    expect(onMenuClick).toHaveBeenCalled();
  });

  it('renders with appropriate ARIA roles and labels', () => {
    render(<Header />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  });

  it('applies responsive classes correctly', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    
    expect(header).toHaveClass(
      'sticky',
      'top-0',
      'z-50',
      'w-full',
      'border-b',
      'bg-white',
      'dark:bg-gray-800'
    );
  });

  it('renders NavigationMenu when provided', () => {
    const NavigationMenu = () => <nav>Navigation</nav>;
    render(<Header navigationMenu={<NavigationMenu />} />);
    
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('maintains layout when title is very long', () => {
    const longTitle = 'Very'.repeat(20) + ' Long Title';
    render(<Header title={longTitle} />);
    
    const title = screen.getByText(longTitle);
    expect(title).toHaveClass('truncate');
  });

  it('applies hover styles to theme toggle button', () => {
    render(<Header />);
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
    
    expect(themeToggle).toHaveClass('hover:bg-gray-100', 'dark:hover:bg-gray-700');
  });
});
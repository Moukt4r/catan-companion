import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Header } from '../Header';
import { useTheme } from 'next-themes';

// Mock lucide-react components
jest.mock('lucide-react', () => ({
  Sun: () => <div data-testid="sun-icon">Sun</div>,
  Moon: () => <div data-testid="moon-icon">Moon</div>,
  Menu: () => <div data-testid="menu-icon">Menu</div>,
}));

// Mock useTheme hook
jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}));

describe('Header', () => {
  const mockUseTheme = useTheme as jest.Mock;

  beforeEach(() => {
    // Default theme setup
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      systemTheme: 'light'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('renders the default title', () => {
    render(<Header />);
    expect(screen.getByText('Catan Companion')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('bg-white', 'dark:bg-gray-800');
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
    const setTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme,
      systemTheme: 'light'
    });

    const { rerender } = render(<Header />);
    const themeToggle = screen.getByLabelText(/toggle theme/i);
    
    fireEvent.click(themeToggle);
    expect(setTheme).toHaveBeenCalledWith('dark');

    // Simulate dark theme
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme,
      systemTheme: 'light'
    });

    // Rerender the same component instance
    rerender(<Header />);
    fireEvent.click(themeToggle);
    expect(setTheme).toHaveBeenCalledWith('light');
  });

  it('shows appropriate icon based on current theme', () => {
    // Light theme
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      systemTheme: 'light'
    });
    const { rerender } = render(<Header />);
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();

    // Dark theme
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: jest.fn(),
      systemTheme: 'light'
    });
    rerender(<Header />);
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });

  it('renders menu button for mobile view', () => {
    render(<Header />);
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    expect(screen.getByLabelText(/menu/i)).toBeInTheDocument();
  });

  it('handles menu click', () => {
    const onMenuClick = jest.fn();
    render(<Header onMenuClick={onMenuClick} />);
    
    const menuButton = screen.getByLabelText(/menu/i);
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
    const themeToggle = screen.getByLabelText(/toggle theme/i);
    
    expect(themeToggle).toHaveClass('hover:bg-gray-100', 'dark:hover:bg-gray-700');
  });
});
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Header from '../Header';

const mockSetTheme = jest.fn();
const mockUseTheme = jest.fn(() => ({
  theme: 'light',
  setTheme: mockSetTheme
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => mockUseTheme()
}));

// Mock lucide-react components
jest.mock('lucide-react', () => ({
  Sun: () => <span data-testid="sun-icon">Sun</span>,
  Moon: () => <span data-testid="moon-icon">Moon</span>
}));

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('renders with default props', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    
    // Check default title
    expect(screen.getByText('Catan Companion')).toBeInTheDocument();
    
    // Check that base classes are applied without any custom class
    const classList = header.className.split(' ').filter(Boolean);
    expect(classList).toContain('p-4');
    expect(classList).toContain('bg-blue-600');
    expect(classList).toContain('text-white');
    expect(classList.length).toBe(4); // Including dark: class
  });

  it('applies custom className correctly', () => {
    render(<Header className="test-class" />);
    const header = screen.getByRole('banner');
    const classList = header.className.split(' ').filter(Boolean);

    // Should have all default classes plus our custom class
    expect(classList).toContain('p-4');
    expect(classList).toContain('bg-blue-600');
    expect(classList).toContain('text-white');
    expect(classList).toContain('test-class');
  });

  it('renders custom title', () => {
    render(<Header title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('handles theme changes correctly', () => {
    // Test light theme
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    });
    const { rerender } = render(<Header />);
    
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    
    // Toggle to dark theme
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');

    // Re-render with dark theme
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    });
    rerender(<Header />);
    
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
    
    // Toggle back to light theme
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('maintains responsive layout', () => {
    render(<Header />);
    
    // Container has correct classes
    const container = screen.getByRole('banner').firstElementChild;
    expect(container).toHaveClass(
      'container',
      'mx-auto',
      'flex',
      'justify-between',
      'items-center'
    );
    
    // Title has correct classes
    const title = screen.getByText('Catan Companion');
    expect(title).toHaveClass('text-2xl', 'font-bold');
    
    // Theme toggle has correct classes
    const themeButton = screen.getByRole('button');
    expect(themeButton).toHaveClass(
      'p-2',
      'rounded-full',
      'hover:bg-blue-500',
      'dark:hover:bg-blue-700',
      'transition-colors'
    );
  });

  it('provides correct ARIA labels for theme toggle', () => {
    // Light theme
    render(<Header />);
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to dark mode'
    );
    
    // Dark theme
    cleanup();
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    });
    render(<Header />);
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to light mode'
    );
  });

  it('handles undefined theme gracefully', () => {
    mockUseTheme.mockReturnValue({
      theme: undefined,
      setTheme: mockSetTheme
    });
    render(<Header />);
    
    // Should default to light theme UI
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to dark mode'
    );
  });
});
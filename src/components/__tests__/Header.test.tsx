import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Header from '../Header';

const mockSetTheme = jest.fn();
const mockUseTheme = jest.fn();

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
    
    // Mock useTheme implementation
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    });
  });

  it('renders the default title', () => {
    render(<Header />);
    expect(screen.getByText('Catan Companion')).toBeInTheDocument();
  });

  it('renders a custom title when provided', () => {
    render(<Header title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('maintains default classes when no className is provided', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    
    // Check base classes are present
    expect(header).toHaveClass(
      'p-4', 
      'bg-blue-600', 
      'text-white'
    );

    // No extra whitespace in className
    const classAttr = header.getAttribute('class')?.trim();
    expect(classAttr).toBeDefined();
    expect(classAttr).not.toMatch(/\s{2,}/);
  });

  it('correctly combines custom classes with defaults', () => {
    render(<Header className="custom-class" />);
    const header = screen.getByRole('banner');
    
    // Check both default and custom classes
    expect(header).toHaveClass('p-4');
    expect(header).toHaveClass('bg-blue-600');
    expect(header).toHaveClass('text-white');
    expect(header).toHaveClass('custom-class');
  });

  it('renders with appropriate ARIA roles and labels', () => {
    // Test light theme
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();

    // Test dark theme
    cleanup();
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    });
    render(<Header />);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  });

  it('maintains responsive layout', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    
    // Container has flex layout classes
    const container = header.firstElementChild;
    expect(container).toHaveClass(
      'container', 
      'mx-auto',
      'flex',
      'justify-between',
      'items-center'
    );
    
    // Title has appropriate text classes
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-2xl', 'font-bold');
    
    // Theme toggle has appropriate styling
    const themeButton = screen.getByRole('button');
    expect(themeButton).toHaveClass(
      'p-2',
      'rounded-full',
      'hover:bg-blue-500',
      'transition-colors'
    );
  });

  it('shows appropriate icons based on theme state', () => {
    // Test light theme icons
    render(<Header />);
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark mode');
    cleanup();

    // Test dark theme icons
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    });
    render(<Header />);
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('toggles theme correctly', () => {
    // Test toggling from light to dark
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    });
    render(<Header />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');

    cleanup();

    // Test toggling from dark to light
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    });
    render(<Header />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('handles undefined theme gracefully', () => {
    mockUseTheme.mockReturnValue({
      theme: undefined,
      setTheme: mockSetTheme
    });
    render(<Header />);

    // Should default to light theme behavior
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark mode');
  });
});
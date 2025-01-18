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
    expect(screen.getByRole('banner')).toHaveClass('bg-blue-600');
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
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    });
    
    render(<Header />);
    
    // Verify initial moon icon is shown for light theme
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    
    // Click theme toggle
    const themeToggle = screen.getByRole('button', {
      name: /switch to dark mode/i
    });
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
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    });
    
    render(<Header />);
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });

  it('renders with appropriate ARIA roles and labels', () => {
    render(<Header />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('maintains responsive layout', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    
    expect(header).toHaveClass(
      'p-4',
      'bg-blue-600',
      'dark:bg-blue-800',
      'text-white'
    );

    const container = screen.getByRole('banner').firstChild;
    expect(container).toHaveClass(
      'container',
      'mx-auto',
      'flex',
      'justify-between',
      'items-center'
    );
  });
});

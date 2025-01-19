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

  it('applies and combines custom className correctly', () => {
    render(<Header className="custom-class" />);
    const header = screen.getByRole('banner');
    
    // Should have both default and custom classes
    expect(header).toHaveClass('p-4', 'bg-blue-600', 'text-white', 'custom-class');
  });

  it('maintains default classes when no className is provided', () => {
    const { container } = render(<Header />);
    const header = screen.getByRole('banner');
    
    // Should have default classes
    expect(header).toHaveClass('p-4', 'bg-blue-600', 'text-white');

    // Should not have extraneous space in class string
    const classAttr = header.getAttribute('class');
    expect(classAttr).not.toMatch(/\s{2,}/); // No multiple spaces
    expect(classAttr).not.toMatch(/^\s/); // No leading space
    expect(classAttr).not.toMatch(/\s$/); // No trailing space
  });

  it('toggles theme from light to dark', () => {
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

  it('toggles theme from dark to light', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    });
    
    render(<Header />);
    
    // Verify initial sun icon is shown for dark theme
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    
    // Click theme toggle
    const themeToggle = screen.getByRole('button', {
      name: /switch to light mode/i
    });
    fireEvent.click(themeToggle);
    
    // Verify setTheme was called with light
    expect(mockSetTheme).toHaveBeenCalledWith('light');
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
    const banner = screen.getByRole('banner');
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
    
    expect(banner).toBeInTheDocument();
    expect(themeToggle).toBeInTheDocument();
    
    // Test ARIA label for dark theme
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

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-2xl', 'font-bold');

    const themeButton = screen.getByRole('button');
    expect(themeButton).toHaveClass(
      'p-2',
      'rounded-full',
      'hover:bg-blue-500',
      'dark:hover:bg-blue-700',
      'transition-colors'
    );
  });
});
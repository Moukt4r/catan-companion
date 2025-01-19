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

  it('renders with no props', () => {
    const Element = Header as any; // To avoid TypeScript prop validation
    const { container } = render(<Element />);
    const header = container.firstChild as HTMLElement;
    
    // Should render with default title
    expect(screen.getByText('Catan Companion')).toBeInTheDocument();
    
    // Should have default classes but no extra className
    const classList = header.className.split(' ').filter(Boolean);
    expect(classList).toEqual(['p-4', 'bg-blue-600', 'text-white']);
    expect(classList).not.toContain('undefined');
    expect(classList).not.toContain('null');
  });

  it('renders with empty className', () => {
    render(<Header className="" />);
    const header = screen.getByRole('banner');
    const classList = header.className.split(' ').filter(Boolean);
    
    // Should have default classes but no extra whitespace
    expect(classList).toEqual(['p-4', 'bg-blue-600', 'text-white']);
  });

  it('renders custom title', () => {
    render(<Header title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.queryByText('Catan Companion')).not.toBeInTheDocument();
  });

  it('combines custom className correctly', () => {
    render(<Header className="custom-class" />);
    const header = screen.getByRole('banner');
    const classList = header.className.split(' ').filter(Boolean);
    
    // Should have default classes plus custom class
    expect(classList).toEqual(['p-4', 'bg-blue-600', 'text-white', 'custom-class']);
  });

  it('handles theme correctly', () => {
    // Light theme
    const { rerender } = render(<Header />);
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark mode');
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');

    // Dark theme
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    });
    rerender(<Header />);
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light mode');
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('handles undefined theme correctly', () => {
    mockUseTheme.mockReturnValue({
      theme: undefined,
      setTheme: mockSetTheme
    });
    render(<Header />);
    
    // Should default to light theme behavior
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark mode');
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('maintains semantic layout', () => {
    render(<Header />);
    
    // Proper heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-2xl', 'font-bold');
    expect(heading).toHaveTextContent('Catan Companion');

    // Proper banner role
    const banner = screen.getByRole('banner');
    expect(banner.firstElementChild).toHaveClass(
      'container',
      'mx-auto',
      'flex',
      'justify-between',
      'items-center'
    );

    // Theme toggle button
    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'p-2',
      'rounded-full',
      'hover:bg-blue-500',
      'transition-colors'
    );
  });
});
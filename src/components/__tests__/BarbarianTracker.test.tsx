import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BarbarianTracker } from '../../components/BarbarianTracker';
import '@testing-library/jest-dom';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Swords: () => <div data-testid="swords-icon" />,
  Settings: () => <div data-testid="settings-icon" />
}));

describe('BarbarianTracker', () => {
  beforeEach(() => {
    // Mock Audio
    (global as any).Audio = class {
      play() {
        return Promise.resolve();
      }
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders initial state', () => {
    render(<BarbarianTracker />);
    expect(screen.getByText('Barbarian Progress')).toBeInTheDocument();
    expect(screen.getByText('Knights: 0')).toBeInTheDocument();
  });

  it('advances progress when clicking advance button', () => {
    render(<BarbarianTracker defaultThreshold={7} />);
    const advanceButton = screen.getByRole('button', { name: /advance/i });
    
    act(() => {
      fireEvent.click(advanceButton);
      jest.runAllTimers();
    });
    
    // Progress bar width should be about 14.29% (1/7)
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '14');
  });

  it('adds knights when clicking add knight button', () => {
    render(<BarbarianTracker />);
    const addKnightButton = screen.getByRole('button', { name: /add knight/i });
    
    act(() => {
      fireEvent.click(addKnightButton);
      jest.runAllTimers();
    });
    
    expect(screen.getByText('Knights: 1')).toBeInTheDocument();
  });

  it('shows settings panel when clicking settings button', () => {
    render(<BarbarianTracker />);
    const settingsButton = screen.getByTitle('Configure threshold');
    
    act(() => {
      fireEvent.click(settingsButton);
      jest.runAllTimers();
    });
    
    expect(screen.getByLabelText(/attack threshold/i)).toBeInTheDocument();
  });

  it('updates threshold via settings', () => {
    render(<BarbarianTracker />);
    const settingsButton = screen.getByTitle('Configure threshold');
    
    act(() => {
      fireEvent.click(settingsButton);
      jest.runAllTimers();
    });
    
    const thresholdInput = screen.getByRole('spinbutton', { name: /attack threshold/i });
    act(() => {
      fireEvent.change(thresholdInput, { target: { value: '10' } });
      jest.runAllTimers();
    });
    
    expect(thresholdInput).toHaveValue(10);
  });

  it('ignores invalid threshold inputs', () => {
    render(<BarbarianTracker />);
    const settingsButton = screen.getByTitle('Configure threshold');
    
    act(() => {
      fireEvent.click(settingsButton);
      jest.runAllTimers();
    });
    
    const thresholdInput = screen.getByRole('spinbutton', { name: /attack threshold/i });
    
    act(() => {
      fireEvent.change(thresholdInput, { target: { value: '-5' } });
      jest.runAllTimers();
    });
    expect(thresholdInput).toHaveValue(7); // Default value
    
    act(() => {
      fireEvent.change(thresholdInput, { target: { value: '0' } });
      jest.runAllTimers();
    });
    expect(thresholdInput).toHaveValue(7); // Default value
  });

  it('allows controlling via ref', () => {
    const ref = React.createRef<{ advance: () => void }>();
    render(<BarbarianTracker ref={ref} defaultThreshold={5} />);
    
    act(() => {
      ref.current?.advance();
      jest.runAllTimers();
    });
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '20');
  });

  it('maintains attack history', () => {
    render(<BarbarianTracker defaultThreshold={7} />);
    const addKnightButton = screen.getByRole('button', { name: /add knight/i });
    const advanceButton = screen.getByRole('button', { name: /advance/i });
    
    // First attack - no knights
    for (let i = 0; i < 7; i++) {
      act(() => {
        fireEvent.click(advanceButton);
        jest.runAllTimers();
      });
    }
    
    // Add knights for second attack
    for (let i = 0; i < 3; i++) {
      act(() => {
        fireEvent.click(addKnightButton);
        jest.runAllTimers();
      });
    }
    
    // Second attack - with knights
    for (let i = 0; i < 7; i++) {
      act(() => {
        fireEvent.click(advanceButton);
        jest.runAllTimers();
      });
    }
    
    // Check history
    expect(screen.getByText(/attack history/i)).toBeInTheDocument();
    const failedText = screen.getAllByText(/failed!/i);
    const defendedText = screen.getAllByText(/defended!/i);
    expect(failedText).toHaveLength(1);
    expect(defendedText).toHaveLength(1);
  });

  it('displays progress bar correctly at max value', () => {
    render(<BarbarianTracker defaultThreshold={3} />);
    const advanceButton = screen.getByRole('button', { name: /advance/i });
    
    act(() => {
      fireEvent.click(advanceButton);
      fireEvent.click(advanceButton);
      jest.runAllTimers();
    });
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '67');
  });
});
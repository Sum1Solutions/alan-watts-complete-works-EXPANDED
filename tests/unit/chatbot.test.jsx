import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatBot from '../../src/ChatBot.jsx';

// Mock the content recommendations
vi.mock('../../src/data.enhanced.js', () => ({
  getContentRecommendations: vi.fn(() => ['The Wisdom of Insecurity', 'The Book'])
}));

describe('ChatBot Component', () => {
  const mockOnContentRequest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch for API calls
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          response: 'Hello! This is a test response from Sum1namedAlan.',
          model: 'test-model'
        }),
      })
    );
  });

  it('should render with default greeting message', () => {
    render(<ChatBot />);
    
    expect(screen.getByText(/Sum1NamedAlan/)).toBeInTheDocument();
    expect(screen.getByText(/Hello! I'm Sum1namedAlan/)).toBeInTheDocument();
  });

  it('should display theme toggle when showThemeToggle is true', () => {
    render(<ChatBot showThemeToggle={true} />);
    
    expect(screen.getByTitle(/Switch to.*mode/)).toBeInTheDocument();
  });

  it('should send message on Enter key press', async () => {
    render(<ChatBot onContentRequest={mockOnContentRequest} />);
    
    const input = screen.getByPlaceholderText(/Ask about Alan's journey/);
    const sendButton = screen.getByText('Send');
    
    fireEvent.change(input, { target: { value: 'What is anxiety?' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server Error')
      })
    );

    render(<ChatBot />);
    
    const input = screen.getByPlaceholderText(/Ask about Alan's journey/);
    const sendButton = screen.getByText('Send');
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/cosmic machinery/)).toBeInTheDocument();
    });
  });

  it('should maintain focus on input after sending message', async () => {
    render(<ChatBot />);
    
    const input = screen.getByPlaceholderText(/Ask about Alan's journey/);
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it('should trigger content recommendations', async () => {
    render(<ChatBot onContentRequest={mockOnContentRequest} />);
    
    const input = screen.getByPlaceholderText(/Ask about Alan's journey/);
    
    fireEvent.change(input, { target: { value: 'I am anxious' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockOnContentRequest).toHaveBeenCalledWith({
        type: 'recommendations',
        content: ['The Wisdom of Insecurity', 'The Book'],
        context: 'Based on our conversation, you might find these resources helpful'
      });
    });
  });
});
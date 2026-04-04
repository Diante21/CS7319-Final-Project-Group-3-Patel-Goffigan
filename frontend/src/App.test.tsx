import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AI Resume Analyzer heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /AI Resume Analyzer/i });
  expect(heading).toBeInTheDocument();
});

test('renders architecture toggle buttons', () => {
  render(<App />);
  const buttons = screen.getAllByRole('button');
  const layeredBtn = buttons.find((b) => b.textContent?.includes('Layered'));
  const eventBtn = buttons.find((b) => b.textContent?.includes('Event-Based'));
  expect(layeredBtn).toBeInTheDocument();
  expect(eventBtn).toBeInTheDocument();
});

test('renders Submit Resume panel', () => {
  render(<App />);
  expect(screen.getByText(/Submit Resume/i)).toBeInTheDocument();
});

test('renders empty state prompt', () => {
  render(<App />);
  expect(screen.getByText(/Ready to Analyze/i)).toBeInTheDocument();
});

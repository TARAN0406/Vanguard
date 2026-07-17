import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import * as api from './services/api';

// Mock the API calls so we don't need a live backend
vi.mock('./services/api', () => ({
  getEmployees: vi.fn(() => Promise.resolve({ data: [] })),
  getEmployeeById: vi.fn(),
  investigateEmployee: vi.fn(),
  freezeEmployee: vi.fn(),
  getAuditLogs: vi.fn()
}));

describe('App & Authentication Component', () => {
  it('renders the login screen securely by default', () => {
    render(<App />);
    expect(screen.getByText(/Insider Threat Intelligence/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Access Secure Portal/i })).toBeInTheDocument();
  });

  it('validates credentials and blocks invalid login', () => {
    render(<App />);
    const roleSelect = screen.getByRole('combobox');
    const passwordInput = screen.getByPlaceholderText(/employee123/i);
    const submitButton = screen.getByRole('button', { name: /Access Secure Portal/i });

    // Select Employee
    fireEvent.change(roleSelect, { target: { value: 'Employee' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong_password' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Invalid Employee credentials/i)).toBeInTheDocument();
  });

  it('authorizes valid login and transitions to dashboard', async () => {
    render(<App />);
    const roleSelect = screen.getByRole('combobox');
    const passwordInput = screen.getByPlaceholderText(/employee123/i);
    const submitButton = screen.getByRole('button', { name: /Access Secure Portal/i });

    fireEvent.change(roleSelect, { target: { value: 'Employee' } });
    fireEvent.change(passwordInput, { target: { value: 'employee123' } });
    fireEvent.click(submitButton);

    // After login, we should see Dashboard elements
    await waitFor(() => {
      expect(screen.queryByText(/Insider Threat Intelligence/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Total Monitored/i)).toBeInTheDocument();
    });
  });
});

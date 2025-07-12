/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';
import SettingsBillingPage from '@/pages/Settings/SettingsBillingPage';


describe('SettingsBillingPage', () => {
  beforeEach(() => {
    render(<SettingsBillingPage />);
  });

  describe('Add-ons Management', () => {
    it('should handle workspace add-ons correctly', async () => {
      await waitFor(() => {
        expect(screen.getByText(/workspaces/i)).toBeInTheDocument();
      });

      const addButton = screen.getAllByRole('button', { name: /plus/i })[0];
      const removeButton = screen.getAllByRole('button', { name: /minus/i })[0];

      // Test adding workspace
      await userEvent.click(addButton);
      expect(screen.getByText(/4 \/ 2 workspaces/i)).toBeInTheDocument();

      // Test removing workspace
      await userEvent.click(removeButton);
      expect(screen.getByText(/3 \/ 2 workspaces/i)).toBeInTheDocument();

      // Test max limit warning
      await userEvent.click(addButton);
      await userEvent.click(addButton);
      expect(screen.getByText(/you are currently over your plan limits/i)).toBeInTheDocument();
    });

    it('should handle member add-ons correctly', async () => {
      await waitFor(() => {
        expect(screen.getByText(/members/i)).toBeInTheDocument();
      });

      const addButton = screen.getAllByRole('button', { name: /plus/i })[1];
      const removeButton = screen.getAllByRole('button', { name: /minus/i })[1];

      // Test adding member
      await userEvent.click(addButton);
      expect(screen.getByText(/5 \/ 3 members/i)).toBeInTheDocument();

      // Test removing member
      await userEvent.click(removeButton);
      expect(screen.getByText(/4 \/ 3 members/i)).toBeInTheDocument();

      // Test max limit warning
      await userEvent.click(addButton);
      await userEvent.click(addButton);
      expect(screen.getByText(/you are currently over your plan limits/i)).toBeInTheDocument();
    });
  });

  describe('Invoices Table', () => {
    it('should display invoice history correctly', async () => {
      await waitFor(() => {
        expect(screen.getByText(/invoice history/i)).toBeInTheDocument();
      });

      // Check table headers
      expect(screen.getByText(/date/i)).toBeInTheDocument();
      expect(screen.getByText(/items/i)).toBeInTheDocument();
      expect(screen.getByText(/amount/i)).toBeInTheDocument();
      expect(screen.getByText(/status/i)).toBeInTheDocument();

      // Check invoice data
      expect(screen.getByText(/march 1, 2024/i)).toBeInTheDocument();
      expect(screen.getByText(/pro plan \+ 1 workspace \+ 2 members/i)).toBeInTheDocument();
      expect(screen.getByText(/\$35\.00/i)).toBeInTheDocument();
      expect(screen.getByText(/paid/i)).toBeInTheDocument();
    });
  });

  describe('Plan Switching', () => {
    it('should handle plan switching correctly', async () => {
      await waitFor(() => {
        expect(screen.getByText(/available plans/i)).toBeInTheDocument();
      });

      // Find and click the switch plan button for Free plan
      const switchButton = screen.getByRole('button', { name: /switch plan/i });
      await userEvent.click(switchButton);

      // Verify plan switch
      await waitFor(() => {
        expect(screen.getByText(/successfully switched to free plan/i)).toBeInTheDocument();
      });

      // Verify current plan indicator updated
      expect(screen.getByText(/current plan/i)).toBeInTheDocument();
    });

    it('should disable current plan button', async () => {
      await waitFor(() => {
        expect(screen.getByText(/available plans/i)).toBeInTheDocument();
      });

      const currentPlanButton = screen.getByRole('button', { name: /current plan/i });
      expect(currentPlanButton).toBeDisabled();
    });
  });
}); 
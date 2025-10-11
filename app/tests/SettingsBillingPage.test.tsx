/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import SettingsBillingPage from '@/pages/Settings/SettingsBillingPage';


describe('SettingsBillingPage', () => {
  beforeEach(() => {
    render(
      <Tabs value="billing">
        <SettingsBillingPage />
      </Tabs>
    );
  });

  describe('Add-ons Management', () => {
    it('should render workspace add-on controls', async () => {
      await waitFor(() => {
        expect(screen.getAllByText(/workspaces/i).length).toBeGreaterThan(0);
      });

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render member add-on controls', async () => {
      await waitFor(() => {
        expect(screen.getAllByText(/members/i).length).toBeGreaterThan(0);
      });

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Invoices Table', () => {
    it('should display invoice history section', async () => {
      await waitFor(() => {
        expect(screen.getByText(/invoice history/i)).toBeDefined();
      });

      // Check basic table structure exists
      const tables = screen.getAllByRole('table');
      expect(tables.length).toBeGreaterThan(0);
      expect(screen.getByText(/paid/i)).toBeDefined();
    });
  });

  describe('Plan Switching', () => {
    it('should display available plans section', async () => {
      await waitFor(() => {
        expect(screen.getByText(/available plans/i)).toBeDefined();
      });

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render billing and subscription content', async () => {
      await waitFor(() => {
        expect(screen.getByText(/billing & subscription/i)).toBeDefined();
      });

      expect(screen.getAllByText(/current plan/i).length).toBeGreaterThan(0);
    });
  });
}); 
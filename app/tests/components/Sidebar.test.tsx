import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '../../src/components/Layout/Sidebar';

// Mock the feature flags - return true for all features by default
vi.mock('../../src/lib/featureFlags', () => ({
  isFeatureEnabled: vi.fn(() => true),
  FeatureFlags: {
    COMMUNITY: 'COMMUNITY',
    ASSET_LIBRARY: 'ASSET_LIBRARY',
  },
}));

// Mock the workspace context
vi.mock('../../src/lib/contexts/WorkspaceContext', () => ({
  useWorkspace: vi.fn(() => ({
    currentWorkspace: {
      id: 1,
      name: 'Test Workspace',
      api_key: 'test-key',
      created_at: '2024-01-01',
      description: 'Test workspace description',
      project_ref: 'test-ref',
      user_id: 'user-123',
    },
    isLoading: false,
    workspaces: [],
    error: null,
    setCurrentWorkspace: vi.fn(),
    mutate: vi.fn(),
    refreshWorkspaces: vi.fn(),
  })),
}));

// Mock the workspace switcher modal
vi.mock('../../src/components/Workspace/WorkspaceSwitcherModal', () => ({
  WorkspaceSwitcherModal: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="workspace-switcher-modal" data-open={open}>
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  ),
}));

const TestWrapper = ({ initialPath = '/dashboard' }: { initialPath?: string }) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <div data-testid="content">Content for {initialPath}</div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};

// Helper to render sidebar at specific route
const renderSidebarAtRoute = (path: string) => {
  window.history.pushState({}, '', path);
  return render(<TestWrapper initialPath={path} />);
};

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset history to dashboard
    window.history.pushState({}, '', '/dashboard');
  });

  describe('Basic Rendering', () => {
    it('should render the logo and workspace selector', () => {
      render(<TestWrapper />);

      expect(screen.getByAltText('Yunokit Logo')).toBeTruthy();
      expect(screen.getByText('Test Workspace')).toBeTruthy();
    });

    it('should render standalone navigation items', () => {
      render(<TestWrapper />);

      expect(screen.getByText('Dashboard')).toBeTruthy();
      expect(screen.getByText('Settings')).toBeTruthy();
    });

    it('should render grouped navigation items', () => {
      render(<TestWrapper />);

      expect(screen.getByText('Content')).toBeTruthy();
      expect(screen.getByText('Community')).toBeTruthy();
    });
  });

  describe('Group Expansion Behavior', () => {
    it('should initially expand the group containing the current page', () => {
      renderSidebarAtRoute('/manager');

      // Content group should be expanded (contains /manager)
      expect(screen.getByText('Content Manager')).toBeTruthy();
      expect(screen.getByText('Schema Builder')).toBeTruthy();
      expect(screen.getByText('Library')).toBeTruthy();
    });

    it('should expand a group when clicked', () => {
      render(<TestWrapper />);

      // Initially at dashboard, so no groups should show their items
      expect(screen.queryByText('Content Manager')).toBeNull();

      // Click Content group header
      fireEvent.click(screen.getByText('Content'));

      // Content items should now be visible
      expect(screen.getByText('Content Manager')).toBeTruthy();
      expect(screen.getByText('Schema Builder')).toBeTruthy();
      expect(screen.getByText('Library')).toBeTruthy();
    });

    it('should collapse non-active groups when selecting another group', () => {
      render(<TestWrapper />);

      // Expand Content group
      fireEvent.click(screen.getByText('Content'));
      expect(screen.getByText('Content Manager')).toBeTruthy();

      // Expand Community group
      fireEvent.click(screen.getByText('Community'));
      expect(screen.getByText('Forums')).toBeTruthy();

      // Content group should now be collapsed (since we're not on a content page)
      expect(screen.queryByText('Content Manager')).toBeNull();
    });

    it('should not collapse the active group when selecting another group', () => {
      renderSidebarAtRoute('/manager');

      // Content group should be expanded (contains current page)
      expect(screen.getByText('Content Manager')).toBeTruthy();

      // Click Community group
      fireEvent.click(screen.getByText('Community'));

      // Both groups should be expanded (Content is active, Community is selected)
      expect(screen.getByText('Content Manager')).toBeTruthy(); // Active group stays
      expect(screen.getByText('Forums')).toBeTruthy(); // Selected group opens
    });

    it('should allow collapsing non-active groups', () => {
      render(<TestWrapper />);

      // Expand Content group
      fireEvent.click(screen.getByText('Content'));
      expect(screen.getByText('Content Manager')).toBeTruthy();

      // Click Content group again to collapse
      fireEvent.click(screen.getByText('Content'));

      // Content items should be hidden
      expect(screen.queryByText('Content Manager')).toBeNull();
    });

    it('should not allow collapsing the active group', () => {
      renderSidebarAtRoute('/manager');

      // Content group should be expanded and active
      expect(screen.getByText('Content Manager')).toBeTruthy();

      // Try to collapse the active Content group
      fireEvent.click(screen.getByText('Content'));

      // Content group should remain expanded (cannot collapse active group)
      expect(screen.getByText('Content Manager')).toBeTruthy();
    });
  });

  describe('Active State Indicators', () => {
    it('should highlight the active navigation item', () => {
      renderSidebarAtRoute('/dashboard');

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink?.className).toContain('bg-primary');
    });

    it('should highlight the active group when it contains the current page', () => {
      renderSidebarAtRoute('/manager');

      const contentButton = screen.getByText('Content').closest('button');
      expect(contentButton?.className).toContain('text-primary');
    });

    it('should show correct chevron direction for expanded/collapsed groups', () => {
      render(<TestWrapper />);

      // Content group is collapsed, should show right chevron
      const contentButton = screen.getByText('Content').closest('button');
      expect(contentButton).toBeTruthy();

      // Expand Content group
      fireEvent.click(screen.getByText('Content'));
      
      // Group should now be expanded with down chevron
      expect(screen.getByText('Content Manager')).toBeTruthy();
    });
  });

  describe('Route-based Auto Expansion', () => {
    it('should auto-expand Content group when navigating to content pages', () => {
      renderSidebarAtRoute('/builder');

      expect(screen.getByText('Content Manager')).toBeTruthy();
      expect(screen.getByText('Schema Builder')).toBeTruthy();
    });

    it('should auto-expand Community group when navigating to community pages', () => {
      renderSidebarAtRoute('/community/forums');

      expect(screen.getByText('Forums')).toBeTruthy();
    });

    it('should handle nested routes correctly', () => {
      renderSidebarAtRoute('/manager/editor/123');

      // Should recognize this as a content page and expand Content group
      expect(screen.getByText('Content Manager')).toBeTruthy();
      expect(screen.getByText('Schema Builder')).toBeTruthy();
    });
  });

  describe('Workspace Switcher Integration', () => {
    it('should open workspace switcher when clicking workspace button', () => {
      render(<TestWrapper />);

      fireEvent.click(screen.getByText('Test Workspace'));

      const modal = screen.getByTestId('workspace-switcher-modal');
      expect(modal?.getAttribute('data-open')).toBe('true');
    });
  });
}); 
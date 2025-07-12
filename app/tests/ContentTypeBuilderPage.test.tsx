import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import ContentTypeBuilderPage from '@/pages/ContentTypeBuilderPage';
import { exampleSchemas, mockContentItems } from '@/lib/mocks';


describe('ContentTypeBuilderPage', () => {
  const renderPage = () => {
    return render(
        <ContentTypeBuilderPage />
    );
  };

  describe('Table Rendering', () => {
    it('renders schema table with correct columns', () => {
      renderPage();
      
      // Check for schema table headers
      expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /type/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /fields/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /description/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();
    });

    it('renders content table with correct columns when switching to content tab', async () => {
      renderPage();
      
      // Switch to content tab
      fireEvent.click(screen.getByRole('tab', { name: /content/i }));
      
      // Check for content table headers
      expect(screen.getByRole('columnheader', { name: /title/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /type/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /updated/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /author/i })).toBeInTheDocument();
    });

    it('displays correct schema data in table', () => {
      renderPage();
      
      // Check first schema row
      const firstSchema = exampleSchemas[0];
      const rows = screen.getAllByRole('row');
      const firstRow = rows[1]; // First row after header
      
      expect(within(firstRow).getByText(firstSchema.name)).toBeInTheDocument();
      expect(within(firstRow).getByText(firstSchema.isCollection ? 'Collection' : 'Single')).toBeInTheDocument();
      expect(within(firstRow).getByText(`${firstSchema.fields.length} fields`)).toBeInTheDocument();
    });

    it('displays correct content data in table', () => {
      renderPage();
      fireEvent.click(screen.getByRole('tab', { name: /content/i }));
      
      // Check first content item row
      const firstItem = mockContentItems[0];
      const rows = screen.getAllByRole('row');
      const firstRow = rows[1]; // First row after header
      
      expect(within(firstRow).getByText(firstItem.title)).toBeInTheDocument();
      expect(within(firstRow).getByText(firstItem.author?.name || '')).toBeInTheDocument();
    });
  });

  describe('Multi-select Functionality', () => {
    it('allows selecting multiple schemas', () => {
      renderPage();
      
      // Get all checkboxes (excluding header checkbox)
      const checkboxes = screen.getAllByRole('checkbox').slice(1);
      
      // Select first two schemas
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);
      
      // Check if selection actions bar appears
      expect(screen.getByText('2 selected')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /archive/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('allows selecting all schemas with header checkbox', () => {
      renderPage();
      
      // Click header checkbox
      const headerCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(headerCheckbox);
      
      // Check if all schemas are selected
      const totalSchemas = screen.getAllByRole('checkbox').length - 1; // Subtract header checkbox
      expect(screen.getByText(`${totalSchemas} selected`)).toBeInTheDocument();
    });
  });

  describe('Archiving Functionality', () => {
    it('shows archived status for archived schemas', () => {
      renderPage();
      
      // Find archived schemas
      const archivedSchemas = exampleSchemas.filter(schema => schema.isArchived);
      
      archivedSchemas.forEach(schema => {
        const schemaRow = screen.getByText(schema.name).closest('tr');
        expect(schemaRow).toHaveClass('opacity-60');
      });
    });

    it('allows archiving a schema through the more actions menu', async () => {
      renderPage();
      
      // Click more actions button of first schema
      const firstRow = screen.getAllByRole('row')[1];
      const moreButton = within(firstRow).getByRole('button', { name: /more/i });
      fireEvent.click(moreButton);
      
      // Click archive option
      const archiveButton = screen.getByRole('menuitem', { name: /archive/i });
      fireEvent.click(archiveButton);
      
      // Verify schema is now archived (has opacity class)
      expect(firstRow).toHaveClass('opacity-60');
    });

    it('allows bulk archiving through multi-select', async () => {
      renderPage();
      
      // Select first two schemas
      const checkboxes = screen.getAllByRole('checkbox').slice(1, 3);
      checkboxes.forEach(checkbox => fireEvent.click(checkbox));
      
      // Click bulk archive button
      const archiveButton = screen.getByRole('button', { name: /archive/i });
      fireEvent.click(archiveButton);
      
      // Verify schemas are now archived
      const rows = screen.getAllByRole('row').slice(1, 3);
      rows.forEach(row => {
        expect(row).toHaveClass('opacity-60');
      });
    });
  });
}); 
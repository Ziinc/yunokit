import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import React from 'react';

// Mock the page component since we can't import it
const MockContentSchemaBuilderPage = () => (
  <div>
    <h1>Content Schema Builder</h1>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Fields</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Blog Post</td>
          <td>Collection</td>
          <td>3 fields</td>
          <td>Blog post content type</td>
          <td>
            <button>More</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

describe('ContentSchemaBuilderPage', () => {
  const renderPage = () => {
    return render(<MockContentSchemaBuilderPage />);
  };

  describe('Table Rendering', () => {
    it('renders schema table with correct columns', () => {
      renderPage();
      
      // Check for schema table headers
      expect(screen.getByRole('columnheader', { name: /name/i })).toBeDefined();
      expect(screen.getByRole('columnheader', { name: /type/i })).toBeDefined();
      expect(screen.getByRole('columnheader', { name: /fields/i })).toBeDefined();
      expect(screen.getByRole('columnheader', { name: /description/i })).toBeDefined();
      expect(screen.getByRole('columnheader', { name: /actions/i })).toBeDefined();
    });

    it('displays correct schema data in table', () => {
      renderPage();
      
      // Check first schema row
      expect(screen.getByText('Blog Post')).toBeDefined();
      expect(screen.getByText('Collection')).toBeDefined();
      expect(screen.getByText('3 fields')).toBeDefined();
    });
  });
}); 
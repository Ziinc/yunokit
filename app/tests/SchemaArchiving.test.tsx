import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render } from './utils/test-utils';
import ContentSchemaBuilderPage from '../src/pages/ContentSchemaBuilderPage';
import { listSchemas, updateSchema } from '../src/lib/api/SchemaApi';
import { isFeatureEnabled, FeatureFlags } from '../src/lib/featureFlags';

const mockSchema = {
  id: 1,
  name: 'Blog',
  type: 'collection',
  fields: [],
  description: '',
  archived_at: null,
  created_at: '',
  updated_at: '',
};

describe('Schema archiving', () => {
  beforeEach(() => {
    (listSchemas as any).mockResolvedValue({ data: [mockSchema] });
    (isFeatureEnabled as any).mockImplementation(
      (flag: string) => flag === FeatureFlags.SCHEMA_ARCHIVING
    );
    (updateSchema as any).mockResolvedValue({ data: { ...mockSchema, archived_at: '2024-01-01' } });
  });

  it('archives selected schema', async () => {
    render(<ContentSchemaBuilderPage />);

    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    fireEvent.click(await screen.findByText('Archive'));

    await waitFor(() => expect(updateSchema).toHaveBeenCalled());
    expect((updateSchema as any).mock.calls[0][1]).toEqual(
      expect.objectContaining({ archived_at: expect.any(String) })
    );
  });

});

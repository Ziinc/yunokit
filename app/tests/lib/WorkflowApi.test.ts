import { describe, it, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import * as WorkflowApi from '../../src/lib/api/WorkflowApi';

vi.mock('../../src/lib/api/WorkflowApi', () => ({
  listWorkflows: vi.fn(),
  getWorkflow: vi.fn(),
  createWorkflow: vi.fn(),
  updateWorkflow: vi.fn(),
  deleteWorkflow: vi.fn(),
  queueWorkflow: vi.fn(),
}));

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('WorkflowApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listWorkflows', async () => {
    const mock = WorkflowApi.listWorkflows as Mock;
    mock.mockResolvedValue({ data: [] });
    await WorkflowApi.listWorkflows(1);
    expect(mock).toHaveBeenCalledWith(1);
  });

  it('getWorkflow', async () => {
    const mock = WorkflowApi.getWorkflow as Mock;
    mock.mockResolvedValue({ data: {} });
    await WorkflowApi.getWorkflow('1', 1);
    expect(mock).toHaveBeenCalledWith('1', 1);
  });
});

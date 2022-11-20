export const createProject = jest
  .fn()
  .mockImplementation((attrs) => ({ data: [attrs] }));
export const listProjects = jest.fn().mockResolvedValue({ data: [] });
export const isSchemaExposed = jest.fn().mockResolvedValue(true);
export const isContentTablePresent = jest.fn().mockResolvedValue(true);

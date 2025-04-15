export * from './ContentApi';
export * from './SchemaApi';
export * from './AssetsApi';
export * from './CommentsApi';
export * from './TemplateService';
export * from './TemplateGenerators'; 
export * from './AuthApi';
export * from './SystemAuthorApi';
export * from './WorkspaceApi';

// Initialize all API storage when the app starts
export const initializeApiStorage = async () => {
  const { ContentApi } = await import('./ContentApi');
  const { SchemaApi } = await import('./SchemaApi');
  const { AssetsApi } = await import('./AssetsApi');
  const { CommentsApi } = await import('./CommentsApi');
  const { AuthApi } = await import('./AuthApi');
  const { WorkspaceApi } = await import('./WorkspaceApi');
  
  await WorkspaceApi.initializeStorage();
  await SchemaApi.initializeStorage();
  await ContentApi.initializeStorage();
  await AssetsApi.initializeStorage();
  await CommentsApi.initializeStorage();
  await AuthApi.initializeStorage();
  
  console.log('All API storage initialized with mock data');
}; 
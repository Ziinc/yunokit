import { vi } from 'vitest';
export const FeatureFlags = {
    APPROVAL_FLOWS: 'approvalFlows',
    COMMUNITY: 'community',
    CROSS_PROJECT_DATA_MIGRATIONS: 'crossProjectDataMigrations',
    SYSTEM_AUTHORS: 'systemAuthors',
    SEARCH: 'search',
    ASSET_LIBRARY: 'assetLibrary',
    PSEUDONYM: 'pseudonym',
    PROFILE_LINKS: 'profileLinks',
    PROFILE_PICTURE: 'profilePicture',
    EMAIL_AUTH: 'emailAuth',
    SCHEMA_ARCHIVING: 'schemaArchiving',
  } as const;
  
  export const isFeatureEnabled = vi.fn();
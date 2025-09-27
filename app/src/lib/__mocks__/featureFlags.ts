import { vi } from 'vitest';
export const FeatureFlags = {
    SEARCH: 'search',
    ASSET_LIBRARY: 'assetLibrary',
    PROFILE_LINKS: 'profileLinks',
    PROFILE_PICTURE: 'profilePicture',
    EMAIL_AUTH: 'emailAuth',
    SCHEMA_ARCHIVING: 'schemaArchiving',
    GITHUB_AUTH: 'githubAuth',
    MICROSOFT_AUTH: 'microsoftAuth',
} as const;
  
export const isFeatureEnabled = vi.fn();
import packageJson from '../../package.json';

export type FeatureFlag = keyof typeof packageJson.featureFlags | keyof typeof FeatureFlags;

export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return packageJson.featureFlags[feature] ?? false;
};

// Type-safe feature flag keys
export const FeatureFlags = {
  APPROVAL_FLOWS: 'approvalFlows' as const,
  COMMUNITY: 'community' as const,
  CROSS_PROJECT_DATA_MIGRATIONS: 'crossProjectDataMigrations' as const,
  SYSTEM_AUTHORS: 'systemAuthors' as const,
  SEARCH: 'search' as const,
  ASSET_LIBRARY: 'assetLibrary' as const,
  PSEUDONYM: 'pseudonym' as const,
  PROFILE_LINKS: 'profileLinks' as const,
  PROFILE_PICTURE: 'profilePicture' as const,
  EMAIL_AUTH: 'emailAuth' as const,
  SCHEMA_ARCHIVING: 'schemaArchiving' as const,
} as const;
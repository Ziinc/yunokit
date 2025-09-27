// Define feature flags configuration directly since package.json no longer contains them
const featureFlags = {
  schemaArchiving: false,
  githubAuth: false,
  microsoftAuth: false,
  quickstartTemplates: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return featureFlags[feature] ?? false;
};

// Feature flag keys
export const FeatureFlags = {
  SCHEMA_ARCHIVING: 'schemaArchiving',
  GITHUB_AUTH: 'githubAuth',
  MICROSOFT_AUTH: 'microsoftAuth',
  QUICKSTART_TEMPLATES: 'quickstartTemplates',
} as const;
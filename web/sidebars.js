/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  docs: [
    "intro",
    "features/supabase-integration",
    {
      type: "category",
      label: "Features",
      collapsed: false,
      collapsible: false,
      items: [
        "features/content-management",
        "features/content-types",
        "features/field-types",
        "features/comments",
        "features/api-reference",
        "features/database-migrations",
        "features/best-practices",
        "features/guides",
        "features/feedback",
        "features/voting"
      ],
      link: {
        type: "generated-index",
        description: "The main pluggable features of Supacontent",
      },
    },
  ],
};

module.exports = sidebars;

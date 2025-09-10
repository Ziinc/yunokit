// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes} = require('prism-react-renderer');
const autoprefixer = require("autoprefixer")
const tailwindConfig = require("../shared/tailwind.config").default;
const tailwind = require("tailwindcss");
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;


/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Yunokit",
  tagline: "Plugins for your Supabase backend",
  url: "https://yunokit.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  staticDirectories: ["../shared/static", "static"],
  favicon: "favicon.ico",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        blog: false, // Optional: disable the docs plugin
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          routeBasePath: "/docs", // Serve the blog at the site's root
          breadcrumbs: true,
        },
        gtag: {
          trackingID: "G-H1JDBL1D09",
        },
        
        theme: {
          customCss: ['./src/css/custom.css', '../app/src/index.css'],
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({

      navbar: {
        logo: {
          alt: "yunokit",
          src: "logo.png",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Docs",
          },
          {
            label: "Guides",
            position: "left",
            items: [
              { type: "doc", docsPluginId: "guides", docId: "yunocontent/index", label: "YunoContent" },
              { type: "doc", docsPluginId: "guides", docId: "yunocommunity/index", label: "YunoCommunity" },
            ],
          },
          {
            label: "API Reference",
            position: "left",
            items: [
              { type: "doc", docsPluginId: "reference", docId: "yunocontent", label: "YunoContent" },
              { type: "doc", docsPluginId: "reference", docId: "yunocommunity", label: "YunoCommunity" },
            ],
          },
          {
            to: "/pricing",
            position: "left",
            label: "Pricing",
          },
          {
            to: "/about",
            position: "left",
            label: "About",
          },
          {
            href: "https://app.yunokit.com",
            label: "Sign In",
            position: "right",
          },
          {
            href: "https://github.com/Ziinc/yunokit",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Documentation",
            items: [
              {
                label: "Developer Docs",
                to: "/docs",
              },
              {
                label: "Guides",
                to: "/guides",
              },
              {
                label: "API Reference",
                to: "/reference",
              },
            ],
          },
          {
            title: "Yunokit App",
            items: [
              {
                label: "About",
                to: "/about",
              },
              {
                label: "Pricing",
                to: "/pricing",
              },
              {
                label: "Github",
                href: "https://github.com/Ziinc/yunokit",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Yunokit`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),

  plugins: [
    async (context, options) => {
      return {
        name: "docusaurus-postcss",
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(
            tailwind(tailwindConfig),
            autoprefixer
          );
          return postcssOptions;
        },
      };
    },


    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'guides',
        path: 'docs-guides',
        routeBasePath: 'guides',
        sidebarPath: require.resolve('./sidebars.js'),
        breadcrumbs: false,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'reference',
        path: 'docs-reference',
        routeBasePath: 'reference',
        sidebarPath: require.resolve('./sidebars.js'),
        breadcrumbs: false,
      },
    ],
  ],
};

module.exports = config;

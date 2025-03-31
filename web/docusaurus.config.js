// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes} = require('prism-react-renderer');
const autoprefixer = require("autoprefixer")
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;


/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Supacontent",
  tagline: "Dinosaurs are cool",
  url: "https://www.supacontent.com",
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
        },
        gtag: {
          trackingID: "G-B3P5HGLDR1",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: "supacontent",
          src: "supacontent-logo.png",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Docs",
          },
          {
            to: "/pricing",
            position: "left",
            label: "Pricing",
          },
          {
            href: "https://github.com/Ziinc/supacontent",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Project",
            items: [
              {
                label: "Documentation",
                to: "/",
              },
              {
                label: "Pricing",
                to: "/pricing",
              },
              {
                label: "Github",
                href: "https://github.com/Ziinc/supacontent",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Supacontent`,
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
          // Appends AutoPrefixer.
          console.log("running plugin");
          postcssOptions.plugins.push(autoprefixer);
          return postcssOptions;
        },
      };
    },
  ],
};

module.exports = config;

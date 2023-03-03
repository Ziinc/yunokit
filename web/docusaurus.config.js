// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

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
          routeBasePath: "/", // Serve the blog at the site's root
        },
        theme: {
          customCss: [
            require.resolve("./src/css/custom.css"),
            require.resolve("@ziinc/supacontent-lib/dist/style.css"),
          ],
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
        name: "docusaurus-tailwindcss",
        configurePostCss(postcssOptions) {
          // Appends TailwindCSS and AutoPrefixer.
          console.log("running plugin");
          postcssOptions.plugins.push(require("tailwindcss"));
          postcssOptions.plugins.push(require("autoprefixer"));
          return postcssOptions;
        },
      };
    },
    [
      "docusaurus-plugin-react-docgen-typescript",
      /** @type {import('docusaurus-plugin-react-docgen-typescript').Options} */
      {
        // pass in a single string or an array of strings
        src: "../lib/src/**/*.tsx",
        compilerOptions: {
          include: [require.resolve("@ziinc/supacontent-lib"), "src/**/*"]
        },
        parserOptions: {
          // savePropValueAsString: true,
          // pass parserOptions to react-docgen-typescript
          // here is a good starting point which filters out all
          // types from react
          // propFilter: (prop, component) => {
          //   if (prop.parent) {
          //     return !prop.parent.fileName.includes("@types/react");
          //   }
          //   return true;
          // },
        },
      },
    ],
  ],
};

module.exports = config;

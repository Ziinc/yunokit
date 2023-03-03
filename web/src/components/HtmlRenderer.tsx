import React from "react";
import { renderToString } from "react-dom/server";

import prettier from "prettier/standalone";
import prettierHtml from "prettier/parser-html";
import { DemoProps } from "./types";

import CodeBlock from '@theme/CodeBlock';
export interface HtmlRendererProps extends DemoProps<any> {}
/**
 * Renreders a given component and props to html code
 */
const HtmlRenderer = ({ Component, props }: HtmlRendererProps) => {
  const html = renderToString(<Component {...(props || {})} />).replace(
    / data-reactroot=""/g,
    ""
  );
  const formatted = prettier.format(html, {
    parser: "html",
    plugins: [prettierHtml],
  });
  return <CodeBlock language="html">{formatted}</CodeBlock>;
};
export default HtmlRenderer;

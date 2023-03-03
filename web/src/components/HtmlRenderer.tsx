import React from "react";
import { renderToString } from "react-dom/server";

import prettier from "prettier/standalone";
import prettierHtml from "prettier/parser-html";
import { DemoProps } from "./types";

interface Props extends DemoProps<any> {}
/**
 * Renreders a given component and props to html code
 */
const HtmlRenderer: React.FC<Props> = ({ Component, props }) => {
  const html = renderToString(<Component {...(props || {})} />).replace(
    / data-reactroot=""/g,
    ""
  );
  const formatted = prettier.format(html, {
    parser: "html",
    plugins: [prettierHtml],
  });
  return <pre>{formatted}</pre>;
};
export default HtmlRenderer;

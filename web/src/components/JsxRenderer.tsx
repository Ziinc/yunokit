import reactElementToJSXString from "react-element-to-jsx-string";
import React from "react";
import { DemoProps } from "./types";
import prettier from "prettier/standalone";
import prettierHtml from "prettier/parser-html";
interface Props extends DemoProps<any> {}
/**
 * Renreders a given component and props to JSX code
 */
const JsxRenderer: React.FC<Props> = ({ Component, props }) => {
  const html = reactElementToJSXString(<Component {...(props || {})} />);
  const formatted = prettier.format(html, {
    parser: "html",
    plugins: [prettierHtml],
  });

  return <pre>{formatted}</pre>;
};
export default JsxRenderer;

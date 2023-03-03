import reactElementToJSXString from "react-element-to-jsx-string";
import React from "react";
import { DemoProps } from "./types";
import prettier from "prettier/standalone";
import prettierHtml from "prettier/parser-html";
import prettierBabel from "prettier/parser-babel";
import CodeBlock from "@theme/CodeBlock";
interface Props extends DemoProps<any> {
  // a value
  test?: string;
}
/**
 * Renreders a given component and props to JSX code
 */
const JsxRenderer = ({ Component, props }: Props) => {
  const html = reactElementToJSXString(<Component {...(props || {})} />);
  const formatted = prettier.format(html, {
    parser: "babel",
    plugins: [prettierBabel],
  });

  return <CodeBlock language="jsx">{formatted}</CodeBlock>;
};
export default JsxRenderer;

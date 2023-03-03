import reactElementToJSXString from "react-element-to-jsx-string";
import React from "react";
import { DemoProps } from "./types";
import prettier from "prettier/standalone";
import prettierHtml from "prettier/parser-html";
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
    parser: "html",
    plugins: [prettierHtml],
  });

  return <CodeBlock language="jsx">{formatted}</CodeBlock>;
};
export default JsxRenderer;

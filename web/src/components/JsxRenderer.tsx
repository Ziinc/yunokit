import reactElementToJSXString from "react-element-to-jsx-string";
import React from "react";

const JsxRenderer = ({ Component, props = {} }: any) => {
  return <pre>{reactElementToJSXString(<Component {...props} />)}</pre>;
};
export default JsxRenderer;

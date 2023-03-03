import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import JsxRenderer from "./JsxRenderer";
import HtmlRenderer from "./HtmlRenderer";
import React from "react";
import { DemoProps } from "./types";

interface Props extends DemoProps<any>{
} 
  
const ComponentDemo: React.FC<Props> = ({ Component, props = {} }) => (
  <div className="border border-solid rounded-lg border-green-900 flex flex-col">
    <div className="rounded-lg min-h-[180px] pt-2 px-2  bg-slate-50">
      <Component {...props} />
    </div>
    <div className=" flex-grow px-4 border-green-900 border-t border-x-0 border-b-0 border-solid bg-emerald-200 pt-2">
      <Tabs block={false} className="">
        <TabItem value="jsx" label="JSX" default>
          <JsxRenderer Component={Component} props={props} />
        </TabItem>
        <TabItem value="html" label="HTML">
          <HtmlRenderer Component={Component} props={props} />
        </TabItem>
      </Tabs>
    </div>
  </div>
);

export default ComponentDemo;

import docgen from "react-docgen-typescript";
import React from "react";
import { useDynamicImport } from "docusaurus-plugin-react-docgen-typescript/dist/esm/hooks";

import useGlobalData from "@docusaurus/useGlobalData";

interface Props {
  // testing
  name: string;
}

/**
 *
 * my component documentation
 */
const PropsRenderer: React.FC<Props> = ({ name }) => {
  const props = useDynamicImport(name);
  if (!props) return null
  console.log('props', props)
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Default Value</th>
          <th>Required</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(props).map((key) => {
          return (
            <tr key={key}>
              <td>
                <code>{key}</code>
              </td>
              <td>
                <code>{props[key].type?.name}</code>
              </td>
              <td>
                {props[key].defaultValue && (
                  <code>{props[key].defaultValue.value}</code>
                )}
              </td>
              <td>{props[key].required ? "Yes" : "No"}</td>
              <td>{props[key].description}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PropsRenderer;

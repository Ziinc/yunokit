import { render as originalRender } from "@testing-library/react";
import { SWRConfig } from "swr";
const Wrapper = ({ children }) => {
  return <SWRConfig value={{ dedupingInterval: 0 }}>{children}</SWRConfig>;
};

export const render = (ui, options = {}) =>
  originalRender(ui, { wrapper: Wrapper, ...options });

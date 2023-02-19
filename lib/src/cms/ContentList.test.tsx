import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContentListExample } from "./ContentListExample";

test("displays a list of content items", async () => {
  render(<ContentListExample />);

  await screen.findByText(/My Foo Title/);
  await screen.findByText(/My description/);

  await screen.findByText(/My Bar Title/);
  await screen.findByText(/My awesome description/);
});

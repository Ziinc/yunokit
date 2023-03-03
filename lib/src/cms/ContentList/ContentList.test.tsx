import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContentList } from "../ContentList";

test("displays a list of content items", async () => {
  render(
    <ContentList
      itemDescriptionKey="desc"
      itemTitleKey="title"
      items={[
        {
          data: {
            another: "hidden",
            desc: "My description",
            title: "My Bar Title",
          },
          id: 123,
          user_id: null,
        },
      ]}
    />
  );

  await screen.findByText(/My Bar Title/);
  await screen.findByText(/My description/);
  expect(screen.findByText("hidden")).resolves.toThrow();
});

test("header render", async () => {
  render(
    <ContentList
      itemDescriptionKey="desc"
      itemTitleKey="title"
      header="Thetitle"
      items={[]}
    />
  );
  await screen.findByText(/Thetitle/);
});

test("header render", async () => {
  render(
    <ContentList
      itemDescriptionKey="desc"
      itemTitleKey="title"
      header={<div>some text</div>}
      items={[]}
    />
  );
  await screen.findByText(/some text/);
});

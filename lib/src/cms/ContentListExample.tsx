import { ContentList } from "./ContentList";

export const ContentListExample = () => (
  <ContentList
    items={[
      {
        id: 123,
        user_id: null,
        data: { title: "My Bar Title", desc: "My description" },
      },
      {
        id: 124,
        user_id: null,
        data: { title: "My Foo Title", desc: "My awesome description" },
      },
    ]}
    itemTitleKey="title"
    itemDescriptionKey="desc"
  />
);


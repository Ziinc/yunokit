import { fireEvent, screen } from "@testing-library/react";
import { render } from "./helpers/utils";
import App from "../src/App";
jest.mock("../src/api");
import { listProjects } from "../src/api";

test("Show project selection page", async () => {
  (listProjects as jest.Mock).mockResolvedValue({
    data: [
      {
        id: 1234,
        name: "my-project",
        service_role_key: "123",
        api_url: "https://my-url",
      },
    ],
  });
  render(<App />);

  await screen.findByText(/Select a Supabase project/);
  const project = await screen.findByText("my-project");
  await screen.findByText("https://my-url");

  // navigate to the project page
  fireEvent.click(project);
  await screen.findByText(/Content Items/);
  await screen.findByText(/Content Types/);
});

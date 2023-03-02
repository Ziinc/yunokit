import migrator from "../src/migrations";
jest.mock("fs");
import fs from "fs";

test("copy files", async () => {
  (fs.readdirSync as jest.Mock)
    .mockReturnValue([])
    // existing first
    .mockReturnValueOnce(["123123123123_supacontent_my_file.sql"])
    .mockReturnValueOnce([
      "123123123123_supacontent_my_file.sql",
      "123123123123_to_copy.sql",
    ]);
  await migrator({});
  expect(fs.copyFile).toBeCalledTimes(1);
});

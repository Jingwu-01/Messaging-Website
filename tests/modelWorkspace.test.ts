import { fetchFunc } from "./mockfetch";
import { getModel } from "../src/model/model";
import { beforeAll, expect, test } from "@jest/globals";

const model = getModel();

beforeAll(async () => {
  process.env.DATABASE_HOST = "http://localhost:4318";
  process.env.DATABASE_PATH = "/v1/p2group50";
  process.env.AUTH_PATH = "auth";
  (global as any).fetch = fetchFunc;
  await model.login("test_user");
});

test("Get existing workspace", async () => {
  const data = await model.getWorkspace("existingworkspace_onechannel");
  const expectedPath = "v1/p2group50/existingworkspace_onechannel";
  expect(data.getName()).toBe(expectedPath);
});

test("Get empty workspace", async ()=> {
    const data = await model.getWorkspace("empty_workspace");
    const expectedPath = "v1/p2group50/empty_workspace"
    expect(data.getName()).toBe(expectedPath);
})

test("Get workspace with one channel", async() => {
    const receivedData = await model.getWorkspace("workspace_onechannel");
    const expectedPath = "v1/p2group50/workspace_onechannel"
    expect(receivedData.getName()).toBe(expectedPath);
})

test("Get workspaces", async() => {
  const receivedData = await model.getAllWorkspaces()
  receivedData
  expect(receivedData).toBe(expectedData);
})

test("Add new workspace", async() => {
  const data = await model.addWorkspace("new_workspace")
  console.log(data)
})

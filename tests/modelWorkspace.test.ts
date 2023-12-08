import { fetchFunc } from "./mockfetch";
import { getModel } from "../src/model/model";
import { beforeAll, expect, test } from "@jest/globals";
import { ModelWorkspace } from "../src/model/workspace";

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

test("Get empty workspace", async () => {
  const data = await model.getWorkspace("empty_workspace");
  const expectedPath = "v1/p2group50/empty_workspace";
  expect(data.getName()).toBe(expectedPath);
});

test("Get workspace with one channel", async () => {
  const receivedData = await model.getWorkspace("workspace_onechannel");
  const expectedPath = "v1/p2group50/workspace_onechannel";
  expect(receivedData.getName()).toBe(expectedPath);
});

test("Get workspaces", async () => {
  const received = await model.getAllWorkspaces();
  expect(received).toBeInstanceOf(Map);
  for (const [key, value] of received.entries()) {
    expect(typeof key).toBe("string");
    expect(value).toBeInstanceOf(ModelWorkspace);
  }
});

test("Add new workspace", async () => {
  try {
    await model.addWorkspace("new_workspace");
  } catch (e) {
    expect((e as Error).message).toBe("Not Found");
  }
});

test("Remove workspace", async () => {
  try {
    await model.removeWorkspace("missing_workspace");
  } catch (e) {
    expect((e as Error).message).toBe("Not Found");
  }
});

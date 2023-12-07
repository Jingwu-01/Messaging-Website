import { typedFetch } from "../src/model/utils";
import { fetchFunc } from "./mockfetch";
import { getModel } from "../src/model/model";
import { ModelWorkspace } from "../src/model/workspace";

const model = getModel();

beforeAll(async () => {
  process.env.DATABASE_HOST = "http://localhost:4318";
  process.env.DATABASE_PATH = "/v1/p2group50";
  process.env.AUTH_PATH = "auth";
  (global as any).fetch = fetchFunc;
  await model.login("test_user");
});

test("Successful typedfetch case", async () => {
  const data = await typedFetch<string>(
    `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/fetchSuccessful`
  );
  expect(data).toBe("some body");
});

test("Failed typedfetch case", async () => {
  expect.assertions(1);
  try {
    await typedFetch<string>(
      `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/fetchError`
    );
  } catch (e) {
    expect(e).toMatch("failed fetch");
  }
});

test("Empty content typedfetch", async () => {
  expect.assertions(1);
  try {
    await typedFetch<string>(
      `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/fetchNoContent`
    );
  } catch (e) {
    expect((e as Error).message).toMatch("error parsing JSON input");
  }
});

test("Failed fetch response", async () => {
  expect.assertions(1);
  try {
    await typedFetch<string>(
      `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/fetchResponseError`
    );
  } catch (e) {
    expect((e as Error).message).toMatch("Bad Request");
  }
});

test("Log in / out", async () => {
  await model.logout();
  const res_login = await model.login("test_user");
  expect(res_login.token).toBeInstanceOf(String);
});

test("Workspaces", async () => {
  await model.login("test_user");
  await model.addWorkspace("test_ws_1");
  await model.addWorkspace("test_ws_2");

  const expected_test_ws_1 = new ModelWorkspace({
    doc: {},
    meta: {
      createdAt: 1,
      createdBy: "1",
      lastModifiedAt: 1,
      lastModifiedBy: "1",
    },
    path: "/test_ws_1",
  });

  const expected_test_ws_2 = new ModelWorkspace({
    doc: {},
    meta: {
      createdAt: 1,
      createdBy: "1",
      lastModifiedAt: 1,
      lastModifiedBy: "1",
    },
    path: "/test_ws_2",
  });

  expect(await model.getWorkspace("test_ws_1")).toBe(expected_test_ws_1);
  expect(await model.getWorkspace("test_ws_2")).toBe(expected_test_ws_2);
  expect(await model.getAllWorkspaces()).toBe({
    test_ws_1: expected_test_ws_1,
    test_ws_2: expected_test_ws_2,
  });

  await model.removeWorkspace("test_ws_2");
  expect(await model.getAllWorkspaces()).toBe({
    test_ws_1: expected_test_ws_1,
  });
});

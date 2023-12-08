import { typedFetch } from "../src/model/utils";
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

test("Get 1 existing workspace", async () => {
  try {
    await model.getWorkspace("existingworkspace_onechannel");
  } catch (e) {
    expect((e as Error).message).toBe("What");
  }
});

test("Get workspace that does not exist", async () => {
  try {
    await model.getWorkspace("existingworkspace_onechannel");
  } catch (e) {
    expect((e as Error).message).toBe("error parsing JSON input");
  }
});

test("Successful typedfetch case", async () => {
  const data = await typedFetch<string>(
    `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/fetchSuccessful`,
  );
  expect(data).toBe("some body");
});

test("Failed typedfetch case", async () => {
  expect.assertions(1);
  try {
    await typedFetch<string>(
      `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/fetchError`,
    );
  } catch (e) {
    expect(e).toMatch("failed fetch");
  }
});

test("Empty content typedfetch", async () => {
  expect.assertions(1);
  try {
    await typedFetch<string>(
      `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/fetchNoContent`,
    );
  } catch (e) {
    expect((e as Error).message).toMatch("error parsing JSON input");
  }
});

test("Failed fetch response", async () => {
  expect.assertions(1);
  try {
    await typedFetch<string>(
      `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/fetchResponseError`,
    );
  } catch (e) {
    expect((e as Error).message).toMatch("Bad Request");
  }
});

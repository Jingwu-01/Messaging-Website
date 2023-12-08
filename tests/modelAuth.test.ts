import { fetchFunc } from "./mockfetch";
import { getModel } from "../src/model/model";
import { beforeAll, expect, test } from "@jest/globals";

const model = getModel();

beforeAll(async () => {
  process.env.DATABASE_HOST = "http://localhost:4318";
  process.env.DATABASE_PATH = "/v1/p2group50";
  process.env.AUTH_PATH = "auth";
  (global as any).fetch = fetchFunc;
});

test("Successful login", async () => {
  const data = await model.login("test_user");
  expect(data).toStrictEqual({ token: "test" });
});

test("Duplicated login", async () => {
  try {
    await model.login("test_user");
    await model.login("test_user");
  } catch (e) {
    expect((e as Error).message).toBe("Bad Request");
  }
});

test("Login without username", async () => {
  try {
    await model.login("");
  } catch (e) {
    expect((e as Error).message).toBe("Bad Request");
  }
});

test("Successful logout", async () => {
  await model.login("test_user");
  const data = await model.logout();
  console.log(data)
});

test;

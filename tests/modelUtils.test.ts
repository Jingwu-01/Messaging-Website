import { fetchFunc } from "./mockfetch";
import { beforeAll, expect, test } from "@jest/globals";
import { getDatabasePath, getAuthPath } from "../src/model/utils";

beforeAll(async () => {
  process.env.DATABASE_HOST = "http://localhost:4318";
  process.env.DATABASE_PATH = "/v1/p2group50";
  process.env.AUTH_PATH = "auth";
  (global as any).fetch = fetchFunc;
});

test("Get Database Path", async () => {
  const received = getDatabasePath();
  const expected = "http://localhost:4318" + "/v1/p2group50";
  expect(received).toBe(expected);
});

test("Get Auth Path", async () => {
  const received = getAuthPath();
  const expected = "http://localhost:4318" + "/auth";
  expect(received).toBe(expected);
});

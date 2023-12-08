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

  
test("create new post", async() => {
   
})
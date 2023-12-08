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

test("Get existing workspace", async() => {
    const data = await model.getWorkspace("existingworkspace_onechannel"); 
    expect(data).toBe({
        path: '/v1/p2group50/existingworkspace_onechannel',
        doc: {},
        meta: {
          createdAt: 1701876023839,
          createdBy: 'test_user',
          lastModifiedAt: 1701827861753,
          lastModifiedBy: 'test_user'
        }
      })
})
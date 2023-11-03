import { getModel } from "../model/model";

const owldbModel = getModel();

// let openChannel

beforeAll(async () => {
  require("dotenv").config();
  owldbModel.login("user1").then(() => console.log(owldbModel.getToken));
});

// Test all posts.
test("Get all posts", async () => {
  // This always fails because 'fetch' is not recognized?
  // const data = await owldbModel.getPosts("ws1", "ch1", "Uuc5ABwJhqd4gDd");
  // expect(data).toBe([]);
});

test("Get all workspaces", async () => {
  // Create workspace
  owldbModel.typedModelFetch(`/getallworkspace1`, {
    method: "PUT",
    body: JSON.stringify({}),
  }).then(() => console.log(owldbModel.getToken()));
  owldbModel.typedModelFetch(`/getallworkspace1/channels/`, {
    method: "PUT",
  });
  owldbModel.typedModelFetch(`/getallworkspace2`, {
    method: "PUT",
    body: JSON.stringify({}),
  });
  owldbModel.typedModelFetch(`/getallworkspace2/channels/`, {
    method: "PUT",
  });
  owldbModel.typedModelFetch(`/getallworkspace2/channels/chan1`, {
    method: "PUT",
    body: JSON.stringify({}),
  });
  let result = await owldbModel.getAllWorkspaces();
  expect(result.size).toBe(2);
});

afterAll(async () => {
    owldbModel.logout().then(() => console.log(owldbModel.getToken())); 
});
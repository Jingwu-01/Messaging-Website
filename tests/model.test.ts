import { getModel } from "../src/model/model";

const owldbModel = getModel();

// let openChannel

beforeAll(async () => {
  process.env.DATABASE_HOST = "http://localhost:4318";
  process.env.DATABASE_PATH = "/v1/p2group50_3";
  process.env.AUTH_PATH = "auth";
});

// Test all posts.
test("Get all posts", async () => {
  // This always fails because 'fetch' is not recognized?
  // const data = await owldbModel.getPosts("ws1", "ch1", "Uuc5ABwJhqd4gDd");
  // expect(data).toBe([]);
  console.log("process.env.DATABASE_HOST", process.env.DATABASE_HOST);
});

test("Get all workspaces", async () => {
  // TODO: note that, for all requests below, the owldb server enforces
  // that the user tells it that it's receiving 'application/json' in the
  // header; we can probably put this in the typedModelFetch as
  // a default header as we're only ever sending JSON to the owldb server
  // anyways.

  // Create workspace
  await owldbModel.login("user1");
  console.log(owldbModel.getToken());
  await owldbModel.typedModelFetch(`/getallworkspace1`, {
    method: "PUT",
    body: JSON.stringify({}),
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  console.log(owldbModel.getToken());
  await owldbModel.typedModelFetch(`/getallworkspace1/channels/`, {
    method: "PUT",
    headers: {
      accept: "application/json",
    },
  });
  await owldbModel.typedModelFetch(`/getallworkspace2`, {
    method: "PUT",
    body: JSON.stringify({}),
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  await owldbModel.typedModelFetch(`/getallworkspace2/channels/`, {
    method: "PUT",
    headers: {
      accept: "application/json",
    },
  });
  await owldbModel.typedModelFetch(`/getallworkspace2/channels/chan1`, {
    method: "PUT",
    body: JSON.stringify({}),
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  let result = await owldbModel.getAllWorkspaces();
  expect(result.size).toBe(2);
});

afterAll(async () => {
  // TODO: fix the bug on logout (I think?) where we get an empty response; this is fine
  // *** TYPEDFETCH ASSUMES THAT AN EMPTY RESPONSE IS AN ERROR. OWLDB SOMETIMES THROWS AN EMPTY RESPONSE (correctly)
  // SO KEEP IN MIND *TO MODIFY* TYPED FETCH IN THESE CASES
  owldbModel.logout().then(() => console.log(owldbModel.getToken()));
});

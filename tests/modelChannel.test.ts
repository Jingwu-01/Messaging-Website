import { fetchFunc } from "./mockfetch";
import { getModel } from "../src/model/model";
import { beforeAll, expect, test } from "@jest/globals";
import { ModelChannel } from "../src/model/channel";

const model = getModel();

beforeAll(async () => {
  process.env.DATABASE_HOST = "http://localhost:4318";
  process.env.DATABASE_PATH = "/v1/p2group50";
  process.env.AUTH_PATH = "auth";
  (global as any).fetch = fetchFunc;
  await model.login("test_user");
});

test("Get channel", async () => {
  try {
    await model.getChannel(
      "/existingworkspace_onechannel/channels/existing_onechannel_onepost"
    );
  } catch (e) {
    expect((e as Error).message).toBe("Not Found");
  }
});

test("Get channels", async () => {
  const received = await model.getAllChannels("/existingworkspace_onechannel")
  expect(received).toBeInstanceOf(Map);
  for (const [key, value] of received.entries()) {
    expect(typeof key).toBe("string");
    expect(value).toBeInstanceOf(ModelChannel);
  }
})


test("Add channel", async() => {

})

test("Remove channel", async() => {

})

test("Get Token", async () => {
  const received = model.getToken()
  const expeceted = "test"
  expect(received).toBe(expeceted);
})

test("Get username", async() => {
  const received = model.getUsername()
  const expeceted = ""
  expect(received).toBe(expeceted);
})
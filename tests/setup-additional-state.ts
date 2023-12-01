import { typedFetch } from "../src/model/utils";

export async function setupBasicApp() {
  const { token } = await typedFetch<{
    token: string;
  }>(`${process.env.DATABASE_HOST}/${process.env.AUTH_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: "test_user" }),
  });

  await fetch(`${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  await fetch(`${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/ws1`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  await fetch(
    `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/ws1/channels/`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  await fetch(
    `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/ws1/channels/ch1`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    },
  );

  await fetch(
    `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/ws1/channels/ch1/posts/`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  await fetch(
    `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/ws1/channels/ch1/posts/post1`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msg: "hello",
      }),
    },
  );
}

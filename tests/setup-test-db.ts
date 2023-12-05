import { typedFetch } from "../src/model/utils";

export default async function setupTestDb() {
  const { token } = await typedFetch<{
    token: string;
  }>(`${process.env.DATABASE_HOST}/${process.env.AUTH_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: "test_user" }),
  });

  fetch(`${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}`, {
    method: "PUT",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

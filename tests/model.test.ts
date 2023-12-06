import { typedFetch } from "../src/model/utils";
import { slog } from "../src/slog";
import { fetchFunc } from "./mockfetch";

beforeAll(async () => {
  process.env.DATABASE_HOST = "http://localhost:4318";
  process.env.DATABASE_PATH = "/v1/p2group50";
  process.env.AUTH_PATH = "auth";
  (global as any).fetch = fetchFunc;
});

test('Successful typedfetch case', async () => {
  const data = await typedFetch<string>(`${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/fetchSuccessful`);
  expect(data).toBe('some body');
});

test('Failed typedfetch case', async () => {
  expect.assertions(1);
  try {
    await typedFetch<string>(`${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/fetchError`);
  } catch (e) {
    expect(e).toMatch('failed fetch');
  }
});

// test('Empty content typedfetch', async () => {
//   slog.info("test", ["JSON.parse('')", Promise.resolve(JSON.parse(""))]);
//   expect.assertions(1);
//   try {
//     await typedFetch<string>(`${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/fetchNoContent`);
//   } catch (e) {
//     expect(e).toMatch('Error parsing JSON input');
//   }
// });
import { typedFetch } from "../src/model/utils";
import { fetchFunc } from "./mockfetch";

beforeAll(async () => {
  process.env.DATABASE_HOST = "http://localhost:4318";
  process.env.DATABASE_PATH = "/v1/p2group50";
  process.env.AUTH_PATH = "auth";
  (global as any).fetch = fetchFunc;
});

test('Typical typedfetch case', () => {
  return typedFetch<string>(`${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}/fetchSuccessful`)
  .then(data => {
    expect(data).toBe('some body');
  })
});
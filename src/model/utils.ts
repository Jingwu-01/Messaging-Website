/**
 * Wrapper around fetch to return a Promise that resolves to the desired
 * type. This function does not validate whether the response actually
 * conforms to that type.
 *
 * @param url      url to fetch from
 * @param options  fetch options
 * @returns        a Promise that resolves to the unmarshaled JSON response
 * @throws         an error if the fetch fails, there is no response body,
 *                 or the response is not valid JSON
 */
export function typedFetch<T>(url: string, options?: RequestInit): Promise<T> {
  return fetch(url, options).then((response: Response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // Return decoded JSON if there is a response body or null otherwise
    const contentLength = response.headers.get("Content-Length");
    if (contentLength && contentLength !== "0") {
      // Type of unmarshaled response needs to be validated
      return response.json() as Promise<T>;
    } else {
      // No content
      throw new Error(`unexpected empty response`);
    }
  });
}


// Method to return the path to the database used.
export function getDatabasePath(): string {
      if (process.env.DATABASE_HOST === undefined) {
          throw new Error("Database host is undefined");
      }
      if (process.env.DATABASE_PATH === undefined) {
          throw new Error("Database path is undefined")
      }
      return process.env.DATABASE_HOST + process.env.DATABASE_PATH;
  }

export function getAuthPath(): string {
    if (process.env.DATABASE_HOST === undefined) {
      throw new Error("Database host is undefined");
    }
    return process.env.DATABASE_HOST + "/auth";
  }
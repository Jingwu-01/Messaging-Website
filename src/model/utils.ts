import Ajv from "ajv";
import CreateResponseSchema from "../../schemas/createResponse.json";
import GetChannelsResponseSchema from "../../schemas/getChannelsResponse.json";
import GetWorkspacesResponseSchema from "../../schemas/getWorkspacesResponse.json";
import LoginResponseSchema from "../../schemas/loginResponse.json";
import PatchDocumentResponseSchema from "../../schemas/patchDocumentResponse.json";
import PostResponseSchema from "../../schemas/postResponse.json";
import WorkspaceResponseSchema from "../../schemas/workspaceResponse.json";
import ChannelResponseSchema from "../../schemas/channelResponse.json"

type ValidationFunction = (data: any) => boolean | Promise<any>

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

export function emptyFetch(url: string, options?: RequestInit): Promise<void> {
  return fetch(url, options).then((response: Response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // Return decoded JSON if there is a response body or null otherwise
    const contentLength = response.headers.get("Content-Length");
    if (contentLength && contentLength !== "0") {
      // Should not be a response body
      throw new Error(`expected empty response`);
    } else {
      // No content
      return;
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


// Data validation

const ajv = new Ajv();

// TODO: see if singletons are ok? if not, make these lazy and create new ones on demand?

export const validateCreateResponse = ajv.compile(CreateResponseSchema);

export const validateGetWorkspacesResponse = ajv.compile(GetWorkspacesResponseSchema);

export const validateGetChannelsResponse = ajv.compile(GetChannelsResponseSchema);

export const validateLoginResponse = ajv.compile(LoginResponseSchema);

export const validatePatchDocumentResponse = ajv.compile(PatchDocumentResponseSchema);

export const validatePostResponse = ajv.compile(PostResponseSchema);

export const validateWorkspaceResponse = ajv.compile(WorkspaceResponseSchema);

export const validateChannelResponse = ajv.compile(ChannelResponseSchema);
/**
 * Utlity functions used by our model.
 */

import Ajv from "ajv";
import CreateResponseSchema from "../../schemas/createResponse.json";
import GetChannelsResponseSchema from "../../schemas/getChannelsResponse.json";
import GetWorkspacesResponseSchema from "../../schemas/getWorkspacesResponse.json";
import LoginResponseSchema from "../../schemas/loginResponse.json";
import PatchDocumentResponseSchema from "../../schemas/patchDocumentResponse.json";
import PostResponseSchema from "../../schemas/postResponse.json";
import WorkspaceResponseSchema from "../../schemas/workspaceResponse.json";
import ChannelResponseSchema from "../../schemas/channelResponse.json";
import ExtensionResponseSchema from "../../schemas/extensionResponse.json";
import { ModelReactionUpdate, PatchBody } from "./modelTypes";
import { slog } from "../slog";

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
export async function typedFetch<T>(
  url: string,
  options?: RequestInit,
  timeout?: number
): Promise<T> {
  // Setup request timeout
  const opts = options || {};
  const wait = timeout || 5000; // 5 second default timeout
  const controller = new AbortController();
  opts.signal = controller.signal;
  slog.info("typedFetch: was called");
  setTimeout(() => {
    slog.info("Request timed out");
    controller.abort("Request timed out");
  }, wait);
  const response = await fetch(url, opts);
  slog.info("typedFetch: received response");
  if (!response.ok) {
    slog.info("typedFetch: !response.ok");
    throw new Error(response.statusText);
  }
  // Type of unmarshaled response needs to be validated
  return response.json().catch((err) => {
    throw new Error("error parsing JSON input");
  }) as Promise<T>;
}

/**
 * A fetch function that expects an empty response.
 * @param url a string representing the url endpoint to make the request to
 * @param options a RequestInit object representing the options for the fetch request
 * @returns an empty promise
 */
export async function emptyFetch(
  url: string,
  options?: RequestInit,
  timeout?: number
): Promise<void> {
  // Setup request timeout
  const opts = options || {};
  const wait = timeout || 5000; // 5 second default timeout
  const controller = new AbortController();
  opts.signal = controller.signal;
  setTimeout(() => {
    slog.info("Request timed out");
    controller.abort("Request timed out");
  }, wait);
  const response = await fetch(url, opts);
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
}

/**
 * Returns a string representing the database path.
 * @returns a string representing the database path.
 */
export function getDatabasePath(): string {
  if (process.env.DATABASE_HOST === undefined) {
    throw new Error("Database host is undefined");
  }
  if (process.env.DATABASE_PATH === undefined) {
    throw new Error("Database path is undefined");
  }
  return process.env.DATABASE_HOST + process.env.DATABASE_PATH;
}

/**
 * Returns a string that represents the authorization path.
 * @returns a string representing the authorization path
 */
export function getAuthPath(): string {
  if (process.env.DATABASE_HOST === undefined) {
    throw new Error("Database host is undefined");
  }
  return process.env.DATABASE_HOST + "/auth";
}

export function getPatchBody(
  reactionUpdate: ModelReactionUpdate
): Array<PatchBody> {
  let patches = new Array<PatchBody>();
  let objPath: string;
  let reactionName: string;
  if (reactionUpdate.reactionName === undefined) {
    objPath = "/extensions";
    reactionName = "p2group50";
  } else {
    objPath = "/reactions";
    reactionName = reactionUpdate.reactionName;
  }
  let addReactionObject: PatchBody = {
    path: objPath,
    op: "ObjectAdd",
    value: {},
  };
  patches.push(addReactionObject);
  let addReactionArray: PatchBody = {
    path: `${objPath}/${reactionName}`,
    op: "ObjectAdd",
    value: [],
  };
  patches.push(addReactionArray);
  let op: "ArrayAdd" | "ArrayRemove";
  if (reactionUpdate.add) {
    op = "ArrayAdd";
  } else {
    op = "ArrayRemove";
  }
  let addReaction: PatchBody = {
    path: `${objPath}/${reactionName}`,
    op: op,
    value: reactionUpdate.userName,
  };
  patches.push(addReaction);
  return patches;
}

// Data validation

export const ajv = new Ajv();

export const validateCreateResponse = ajv.compile(CreateResponseSchema);

export const validateGetWorkspacesResponse = ajv.compile(
  GetWorkspacesResponseSchema
);

export const validateGetChannelsResponse = ajv.compile(
  GetChannelsResponseSchema
);

export const validateLoginResponse = ajv.compile(LoginResponseSchema);

export const validatePatchDocumentResponse = ajv.compile(
  PatchDocumentResponseSchema
);

export const validatePostResponse = ajv.compile(PostResponseSchema);

export const validateWorkspaceResponse = ajv.compile(WorkspaceResponseSchema);

export const validateChannelResponse = ajv.compile(ChannelResponseSchema);

export const validateExtensionResponse = ajv.compile(ExtensionResponseSchema);

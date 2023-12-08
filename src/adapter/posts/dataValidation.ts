import { ExtensionResponse } from "../../../types/extensionResponse";
import { validateExtensionResponse } from "../../model/utils";
import { slog } from "../../slog";

/**
 * Validates that the post path is of the correct length from the model; that is,
 * it must be a relative path to the database and be contained in a workspace and channel.
 * @param postPath a string representing a post document path, relative to the database
 * @returns an array of strings split by the / character, or an error if the string is
 * not of the correct nesting length.
 */
export function validatePostPath(postPath: string): string[] {
  let postPathArr = postPath.split("/");
  if (postPathArr.length !== 6) {
    throw new Error(
      "AdapterPost constructor: response path does not have 6 elements but needs to",
    );
  }
  return postPathArr;
}

/**
 * Validates that the parent path is a valid parent in the same workspace and collection as this post,
 * and also that the parent is not the post itself.
 * @param parentPath a string or undefined variable representing the parent path of a post
 * @param postPathArr an array of strings representing the post's path split on / characters
 * @returns a string representing the name of the document name for the parent
 */
export function validateParentPath(
  parentPath: string | undefined,
  postPathArr: string[],
): string {
  // Set the parent of the post, checking for error cases.
  if (parentPath === undefined || parentPath === "") {
    return "";
  }
  let parentPathArr = parentPath.split("/");
  if (parentPathArr.length !== 6) {
    throw new Error(
      "AdapterPost constructor: parentPathArr is not of the correct length",
    );
  }
  let parentName = parentPathArr[5];
  if (postPathArr[1] !== parentPathArr[1]) {
    throw new Error(
      "AdapterPost constructor: workspace name of parent and child are not equal",
    );
  }
  if (postPathArr[3] !== parentPathArr[3]) {
    throw new Error(
      "AdapterPost constructor: channel name of parent and child are not equal",
    );
  }
  if (parentName === undefined) {
    throw new Error(
      "AdapterPost constructor: internal server error (last element of parentPathArr is undefined)",
    );
  }
  if (parentName === postPathArr[5]) {
    throw new Error("AdapterPost constructor: post is its own parent");
  }
  return parentName;
}

/**
 * Validates that the extension contained in the post response follows a valid schema.
 * @param extensions an object representing the extensions attached to a post
 * @returns an ExtensionResponse object representing valid extension data for our application.
 */
export function validateExtension(extensions: any): ExtensionResponse {
  if (extensions === undefined) {
    extensions = {
      p2group50: [],
    };
  } else if (extensions["p2group50"] === undefined) {
    extensions["p2group50"] = [];
  } else if (!validateExtensionResponse(extensions)) {
    slog.error("getWorkspace", [
      "invalid response from getting all workspaces",
      `${validateExtensionResponse.errors}`,
    ]);
    throw new Error("unsupported extension type from owldb");
  }
  return extensions as ExtensionResponse;
}

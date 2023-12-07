import { ExtensionResponse } from "../../../types/extensionResponse";
import { validateExtensionResponse } from "../../model/utils";
import { slog } from "../../slog";

export function validatePostPath(postPath: string): string[] {
    let postPathArr = postPath.split("/");
    if (postPathArr.length !== 6) {
        throw new Error("AdapterPost constructor: response path does not have 6 elements but needs to");
    }
    return postPathArr;
}

export function validateParentPath(parentPath: string | undefined, postPathArr: string[]): string {
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

export function validateExtension(extensions: any): ExtensionResponse {
    if (extensions === undefined) {
      extensions = {
        "p2group50": []
      }
    } else if (extensions["p2group50"] === undefined) {
      extensions["p2group50"] = [];
    } else if (!(validateExtensionResponse(extensions))) {
      slog.error("getWorkspace", [
        "invalid response from getting all workspaces",
        `${validateExtensionResponse.errors}`,
      ]);
      // TODO: make a custom login error class so we can gracefully handle this situation by notifying the user.
      throw new Error(
        "unsupported extension type from owldb",
      );
    }
    return extensions as ExtensionResponse;
}

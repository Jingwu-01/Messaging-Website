/**
 * This file contains various types used by the model to interact with the adapter.
 */

import { PostResponse } from "../../types/postResponse";

/**
 * An event that is thrown every time we receive a post, in the event of single post changes.
 */
export type ModelPostEvent = {
  post: PostResponse;
};

/**
 * An event that is received from the view to send to the model, in the event of a reaction update.
 */
export type ModelReactionUpdate = {
  reactionName: string | undefined;
  userName: string;
  postPath: string;
  add: boolean;
};

/**
 * A type used by the model in fetch calls when patching a document.
 */
export type PatchBody = {
  op: "ArrayAdd" | "ArrayRemove" | "ObjectAdd";
  path: string;
  value: any;
};

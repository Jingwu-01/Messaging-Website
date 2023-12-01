/**
 * Helper functions for converting an adapter post into a type suitable for the view to process.
 */

import { PostResponse } from "../../../types/postResponse";
import { ReactionData, ViewPost } from "../../view/datatypes";
import { AdapterPost } from "./adapterPost";

/**
 * Initializes all reactions to be empty arrays for this post.
 * @param postResponse a JSON object representing the post response received from the database.
 * @returns ReactionData, an object with fields representing reaction names and values which are an array of usernames.
 */
function convertReactions(postResponse: PostResponse): ReactionData {
  // Return empty arrays for each reaction if the reactions are undefined.
  if (postResponse.doc.reactions === undefined) {
    return {
      smile: [],
      frown: [],
      like: [],
      celebrate: [],
    };
  } else {
    // Return empty arrays for supported reactions, copying over all other reactions.
    return {
      smile: [],
      frown: [],
      like: [],
      celebrate: [],
      ...postResponse.doc.reactions,
    };
  }
}

/**
 * Converts an AdapterPost into a ViewPost, suitable for the view to manipulate.
 * @param adapterPost an AdapterPost representing the Adapter's representation of the post.
 * @returns a ViewPost representing a post that the View is able to manipulate.
 */
export function adapterViewPostConverter(adapterPost: AdapterPost): ViewPost {
  return {
    msg: adapterPost.getResponse().doc.msg,
    // Initialze empty reactions for the post.
    reactions: convertReactions(adapterPost.getResponse()),
    extensions: adapterPost.getResponse().doc.extensions,
    createdUser: adapterPost.getResponse().meta.createdBy,
    postTime: adapterPost.getResponse().meta.createdAt,
    children: new Array<ViewPost>(),
    path: adapterPost.getResponse().path,
    parent: adapterPost.getParentName(),
    name: adapterPost.getName(),
    postIdx: adapterPost.getPostIndex(),
  };
}

/**
 * Helper function for calling a method on the view to create a post.
 */

import { slog } from "../../slog";
import getStateManager from "../../state-manager";
import { CreatePostEvent } from "../../view/datatypes";
import { getView } from "../../view/view";

/**
 * Function that calls the model to create a post given an event from the view.
 * @param postData an event encapsulating data needed for creating a post.
 * @returns an empty Promise that tells the view an error if an error occurred for post creation.
 */
export default async function createPost(postData: CreatePostEvent) {
  // Get the open channel from the view to make the request.
  let channel = getStateManager().getOpenChannel();
  // This error occurs when a post is added and the view has not displayed an open channel.
  if (channel === null) {
    throw new Error("Cannot add a post: no open channel");
  }

  // Make the creation request, displaying an error on the view if the request failed.
  return channel
    .createPost(postData.msg, postData.parent, channel.path)
    .then(() => {
      slog.info("createPost: added to the database");
    });
}

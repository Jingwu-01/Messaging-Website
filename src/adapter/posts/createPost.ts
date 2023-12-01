import { slog } from "../../slog";
import getStateManager from "../../state-manager";
import { CreatePostEvent } from "../../view/datatypes";
import { getView } from "../../view/view";

export default async function createPost(postData: CreatePostEvent) {
  // TODO: consider if we want to enforce that a channel are open in order to send a message?
  // you definitely don't, but it's ok for now. might work if event handlers run synchronously for dispatchEvent.
  let channel = getStateManager().getOpenChannel();
  // The view should never allow the user to add a post if there isn't an open channel.
  // If this is thrown, there is a bug.
  if (channel === null) {
    throw new Error("Cannot add a post: no open channel");
  }
  return channel
    .createPost(postData.msg, postData.parent, channel.path)
    .then(() => {
      slog.info("createPost: added to the database");
    })
    .catch(() => {
      getView().displayError("Failed to create post");
      return;
    });
}

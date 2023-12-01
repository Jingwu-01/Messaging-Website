/**
 * Functions for handling events related to posts from both the view and adapter.
 */

import {
  ModelPostEvent,
  ModelReactionUpdate,
} from "../../model/modelTypes";
import { slog } from "../../slog";
import {
  CreatePostEvent,
  ReactionUpdateEvent,
} from "../../view/datatypes";
import { getModel } from "../../model/model";
import getStateManager from "../../state-manager";
import createPost from "./createPost";
import { getView } from "../../view/view";

/**
 * Handles events for post creation.
 */
export function initPosts() {
  document.addEventListener(
    "createPostEvent",
    function (evt: CustomEvent<CreatePostEvent>) {
      slog.info("createPostEvent handler", [
        "create post event",
        `${JSON.stringify(evt.detail)}`,
      ]);
      createPost(evt.detail);
    },
  );

  /**
   * Handles events for reaction updates.
   */
  document.addEventListener(
    "reactionUpdateEvent",
    (event: CustomEvent<ReactionUpdateEvent>) => {
      let model = getModel();
      if (event.detail.userName === undefined) {
        // this corresponds to the case where we forget to remove the event handler, and it still handles the event when there is no username.
        slog.error("reactionUpdateEvent listener", [
          "user name is undefined",
          `${event.detail.userName}`,
        ]);
        return;
      }
      let modelUpdate: ModelReactionUpdate = {
        reactionName: event.detail.reactionName,
        userName: event.detail.userName,
        postPath: event.detail.postPath,
        add: event.detail.add,
      };
      model
        .updateReaction(modelUpdate)
        .then((response) => {
          slog.info("reactionUpdateEvent listener", [
            "update reaction request went through",
            `${JSON.stringify(response)}`,
          ]);
          if (response.patchFailed) {
            // // TODO: display an error on the view, the patch failed
            // slog.error("reactionUpdateEvent listener", ["patchFailed", ""]);
            getView().displayError("error displaying reactions");
          } else {
            // return
            // somehow notify the view? nothing to notify the view here; it's all subscriptions.
          }
        })
        .catch((error: Error) => {
          // TODO: what if it's just a schema error?
          slog.error("reactionUpdateEvent listener", [
            "error from model.updateReaction",
            `${JSON.stringify(error)}`,
          ]);
        });
    },
  );

  /**
   * Handles new model posts from the model.
   */
  document.addEventListener(
    "modelPostEvent",
    function (evt: CustomEvent<ModelPostEvent>) {
      slog.info("modelPostEvent listener: received modelPostEvent", [
        "modelPostEvent.detail",
        `${JSON.stringify(evt.detail)}`,
      ]);
      let result = getStateManager().serializePostResponse(evt.detail.post);
      if (!result[0]) {
        getView().displayError(`${result[1]}`);
      }
    },
  );
}

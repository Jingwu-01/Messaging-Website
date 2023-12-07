/**
 * Functions for handling events related to posts from both the view and adapter.
 */

import { ModelPostEvent, ModelReactionUpdate } from "../../model/modelTypes";
import { slog } from "../../slog";
import {
  CreatePostEvent,
  EventWithId,
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
  // In-progress events that are waiting on a post from the user to come back.
  let eventsWaitingOnPostUpdate: EventWithId[] = [];

  document.addEventListener(
    "createPostEvent",
    async (evt: CustomEvent<CreatePostEvent>) => {
      getView().setStateLoadingUntil(
        ["channels", "posts", "user", "workspaces"],
        evt
      );
      slog.info("createPostEvent handler", [
        "create post event",
        `${JSON.stringify(evt.detail)}`,
      ]);
      await createPost(evt.detail);
      eventsWaitingOnPostUpdate.push(evt);
    }
  );

  /**
   * Handles events for reaction updates.
   */
  document.addEventListener(
    "reactionUpdateEvent",
    async (event: CustomEvent<ReactionUpdateEvent>) => {
      getView().setStateLoadingUntil(
        ["channels", "posts", "user", "workspaces"],
        event
      );
      let model = getModel();
      let modelUpdate: ModelReactionUpdate = {
        reactionName: event.detail.reactionName,
        userName: event.detail.userName,
        postPath: event.detail.postPath,
        add: event.detail.add,
      };
      try {
        const response = await model.updateReaction(modelUpdate);
        slog.info("reactionUpdateEvent listener", [
          "update reaction request went through",
          `${JSON.stringify(response)}`,
        ]);
        if (response.patchFailed) {
          getView().failEvent(event, "error displaying reactions");
        } else {
          eventsWaitingOnPostUpdate.push(event);
        }
      } catch (error) {
        slog.error("reactionUpdateEvent listener", [
          "error from model.updateReaction",
          `${JSON.stringify(error)}`,
        ]);
        getView().failEvent(event, "error displaying reactions");
      }
    }
  );

  /**
   * Handles new model posts from the model.
   */
  document.addEventListener(
    "modelPostEvent",
    function (evt: CustomEvent<ModelPostEvent>) {
      slog.info("modelPostEvent listener: received modelPostEvent", [
        "modelPostEvent.detail",
        evt.detail,
      ]);
      // Render the post
      let [success, message] = getStateManager().serializePostResponse(
        evt.detail.post
      );
      // After everything is rendered, check if this event was the result of an
      // action taken by our user.
      if (
        evt.detail.post.meta.lastModifiedBy ===
        getStateManager().getLoggedInUser()
      ) {
        console.log("reaction updated!");
        eventsWaitingOnPostUpdate.forEach((evt) => {
          if (!success) {
            getView().failEvent(evt, message);
          } else {
            getView().completeEvent(evt);
          }
        });
        eventsWaitingOnPostUpdate = [];
        return;
      }
      // If this was just a random post (not from the user) and the request failed, then display the error.
      if (!success) {
        getView().displayError(message);
      }
    }
  );
}

import { getViewPosts } from "../../main";
import { ModelPostEvent, PostsEvent } from "../../model/modelTypes";
import { slog } from "../../slog";
import {
  CreatePostEvent,
  ReactionUpdateEvent,
  ViewPost,
  ViewPostUpdate,
} from "../../view/datatypes";
import { getView } from "../../view/view";
import { getModel } from "../../model/model";
import getStateManager from "../../state-manager";
import createPost from "./createPost";

export function initPosts() {
  // document.addEventListener(
  //   "postsEvent",
  //   function (evt: CustomEvent<PostsEvent>) {
  //     // TODO: change console.log to slog
  //     slog.info(
  //       "postsEvent",
  //       ["posts", `${JSON.stringify(evt.detail.postRoots)}`],
  //       ["number of post roots", `${evt.detail.postRoots.length}`]
  //     );
  //     let viewPosts = getViewPosts(evt.detail.postRoots);
  //     // TODO: change this, is just a placeholder
  //     let viewPostUpdate: ViewPostUpdate = {
  //       allPosts: viewPosts,
  //       op: "add",
  //       affectedPosts: new Array<ViewPost>(),
  //     };
  //     getView().displayPosts(viewPostUpdate);
  //   }
  // );

  document.addEventListener(
    "createPostEvent",
    function (evt: CustomEvent<CreatePostEvent>) {
      slog.info("createPostEvent handler", [
        "create post event",
        `${JSON.stringify(evt.detail)}`,
      ]);
      createPost(evt.detail);
    }
  );

  document.addEventListener(
    "reactionUpdateEvent",
    (event: CustomEvent<ReactionUpdateEvent>) => {
      let model = getModel();
      model.updateReaction(event.detail.reactionName);
    }
  );

  // document.addEventListener(
  //   "reactionUpdateEvent",
  //   function (evt: CustomEvent<ReactionUpdateEvent>) {
  //     let model = getModel();
  //     // Todo: I need the actual name of the reaction as an input
  //     model.updateReaction("dummyReaction")

  //   }
  // );


  document.addEventListener("modelPostEvent", 
  function(evt: CustomEvent<ModelPostEvent>) {
    slog.info("modelPostEvent listener: received modelPostEvent", ["modelPostEvent.detail", `${JSON.stringify(evt.detail)}`]);
      getAdapter().serializePostResponse(evt.detail.post);
      // TODO: call serializePostResponse, and throw an error on the view if there's any error with the corresponding error message
  })
}

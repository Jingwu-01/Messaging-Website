import { getViewPosts } from "../../main";
import { ModelReactionUpdate, PostsEvent } from "../../model/modelTypes";
import { slog } from "../../slog";
import { CreatePostEvent, ReactionUpdateEvent, ViewPost, ViewPostUpdate } from "../../view/datatypes";
import { getView } from "../../view/view";
import { getModel } from "../../model/model";
import getAdapter from "../adapter";

export function initPosts() {
  document.addEventListener(
    "postsEvent",
    function (evt: CustomEvent<PostsEvent>) {
      // TODO: change console.log to slog
      slog.info("postsEvent", ["posts", `${JSON.stringify(evt.detail.postRoots)}`], ["number of post roots", `${evt.detail.postRoots.length}`]);
      let viewPosts = getViewPosts(evt.detail.postRoots);
      // TODO: change this, is just a placeholder
      let viewPostUpdate: ViewPostUpdate = {
        allPosts: viewPosts,
        op: "add",
        affectedPosts: new Array<ViewPost>(),
      }
      getView().displayPosts(viewPostUpdate);
    }
  );

  document.addEventListener(
    "createPostEvent",
    function (evt: CustomEvent<CreatePostEvent>) {
      slog.info("createPostEvent handler", ["create post event", `${JSON.stringify(evt.detail)}`]);
      getAdapter().createPost(evt.detail);
    }
  )

  document.addEventListener("reactionUpdateEvent", (event: CustomEvent<ReactionUpdateEvent>) => {
    let model = getModel();
    if (event.detail.userName === undefined) {
      // this corresponds to the case where we forget to remove the event handler, and it still handles the event when there is no username.
      slog.error("reactionUpdateEvent listener", ["user name is undefined", `${event.detail.userName}`]);
      return;
    }
    let modelUpdate: ModelReactionUpdate = {
      reactionName: event.detail.reactionName,
      userName: event.detail.userName,
      postPath: event.detail.postPath,
      add: event.detail.add
    }
    model.updateReaction(modelUpdate).then((response) => {
      slog.info("reactionUpdateEvent listener", ["update reaction request went through", `${JSON.stringify(response)}`]);
      if (response.patchFailed) {
        // // TODO: display an error on the view, the patch failed
        // slog.error("reactionUpdateEvent listener", ["patchFailed", ""]);
      } else {
        // return 
      }
    })
    .catch((error: Error) => {
      // TODO: what if it's just a schema error?
      slog.error("reactionUpdateEvent listener", ["error from model.updateReaction", `${JSON.stringify(error)}`]);
    });
  }
  )


  // document.addEventListener(
  //   "reactionUpdateEvent", 
  //   function (evt: CustomEvent<ReactionUpdateEvent>) {
  //     let model = getModel();
  //     // Todo: I need the actual name of the reaction as an input 
  //     model.updateReaction("dummyReaction") 

  //   }
  // );
}

import { getViewPosts } from "../../main";
import { PostsEvent } from "../../model/modelTypes";
import { slog } from "../../slog";
import { CreatePostEvent, ReactionUpdateEvent, ViewPost, ViewPostUpdate } from "../../view/datatypes";
import { getView } from "../../view/view";
import { getModel } from "../../model/model";

export function initPosts() {
  document.addEventListener(
    "postsEvent",
    function (evt: CustomEvent<PostsEvent>) {
      // TODO: change console.log to slog
      slog.info("postsEvent", ["posts", `${JSON.stringify(Object.fromEntries(evt.detail.posts))}`], ["number of posts", `${evt.detail.posts.size}`]);
      let viewPosts = getViewPosts(evt.detail.posts);
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
    }
  )

  document.addEventListener(
    "reactionUpdateEvent", 
    function (evt: CustomEvent<ReactionUpdateEvent>) {
      let model = getModel();
      // Todo: I need the actual name of the reaction as an input 
      model.updateReaction("dummyReaction") 

    }
  )
}

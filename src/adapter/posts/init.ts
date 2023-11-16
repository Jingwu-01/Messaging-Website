import { getViewPosts } from "../../main";
import { PostsEvent } from "../../model/modelTypes";
import { slog } from "../../slog";
import { ReactionUpdateEvent } from "../../view/datatypes";
import { getView } from "../../view/view";
import { getModel } from "../../model/model";

export function initPosts() {
  document.addEventListener(
    "postsEvent",
    function (evt: CustomEvent<PostsEvent>) {
      // TODO: change console.log to slog
      slog.info("postsEvent", ["posts", `${JSON.stringify(Object.fromEntries(evt.detail.posts))}`]);
      let viewPosts = getViewPosts(evt.detail.posts);
      getView().displayPosts(viewPosts);
    }
  );

  document.addEventListener(
    "reactionUpdateEvent", 
    function (evt: CustomEvent<ReactionUpdateEvent>) {
      let model = getModel();
      // Todo: I need the actual name of the reaction as an input 
      model.updateReaction("dummyReaction") 

    }
  )
}

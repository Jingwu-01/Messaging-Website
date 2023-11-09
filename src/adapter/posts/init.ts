import { getViewPosts } from "../../main";
import { PostsEvent } from "../../model/modelTypes";
import { getView } from "../../view/view";

export function initPosts() {
  document.addEventListener(
    "postsEvent",
    function (evt: CustomEvent<PostsEvent>) {
      // TODO: change console.log to slog
      let viewPosts = getViewPosts(evt.detail.posts);
      getView().displayPosts(viewPosts);
    }
  );
}

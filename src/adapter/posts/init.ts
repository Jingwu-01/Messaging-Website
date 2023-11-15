import { getViewPosts } from "../../main";
import { PostsEvent } from "../../model/modelTypes";
import { slog } from "../../slog";
import { getView } from "../../view/view";

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
}

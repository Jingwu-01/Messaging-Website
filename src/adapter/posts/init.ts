import { getViewPosts } from "../../main";
import { PostsEvent } from "../../model/modelTypes";

export function initPosts() {
  document.addEventListener(
    "postsEvent",
    function (evt: CustomEvent<PostsEvent>) {
      // TODO: change console.log to slog
      let viewPosts = getViewPosts(evt.detail.posts);
      console.log(`postsEvent Listener: ${JSON.stringify(viewPosts)}`);
  });
}
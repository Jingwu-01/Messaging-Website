import { PostsEvent } from "../../model/modelTypes";

export function initPosts() {
  document.addEventListener(
    "postsEvent",
    function (evt: CustomEvent<PostsEvent>) {
      // TODO: change console.log to slog
      console.log("postsEvent", evt);
  });
}
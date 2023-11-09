import { initLogin } from "./login/init";
import { initPosts } from "./posts/init";
import { initWorkspaces } from "./workspace/init";

export function initAdapter() {
  initPosts();
  initLogin();
  initWorkspaces();
}

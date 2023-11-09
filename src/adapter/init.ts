import { initLogin } from "./login/init";
import { initPosts } from "./posts/init";

export function initAdapter() {
  initPosts();
  initLogin();
}

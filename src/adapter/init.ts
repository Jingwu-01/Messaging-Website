import { initChannels } from "./channel/init";
import { initLogin } from "./login/init";
import { initPosts } from "./posts/init";
import { initWorkspaces } from "./workspace/init";
import { initLogout } from "./logout/init";

/**
 * Initializes the event handlers for the adapter.
 */
export function initAdapter() {
  initPosts();
  initLogin();
  initLogout();
  initWorkspaces();
  initChannels();
}

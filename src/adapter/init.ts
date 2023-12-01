import { initChannels } from "./channel/init";
import { initLogin } from "./login/init";
import { initPosts } from "./posts/init";
import { initWorkspaces } from "./workspace/init";
import { initLogout } from "./logout/init";
import { AdapterPost } from "./posts/adapterPost";
import { ViewPost } from "../view/datatypes";

export function initAdapter() {
  initPosts();
  initLogin();
  initLogout(); 
  initWorkspaces();
  initChannels();
}

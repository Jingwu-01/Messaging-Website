import { initChannels } from "./channel/init";
import { initLogin } from "./login/init";
import { initPosts } from "./posts/init";
import { initWorkspaces } from "./workspace/init";
import { initLogout } from "./logout/init";
import { AdapterPost } from "./adapterPost";
import { ViewPost } from "../view/datatypes";

export function initAdapter() {
  initPosts();
  initLogin();
  initLogout(); 
  initWorkspaces();
  initChannels();
}

export function adapterViewPostConverter(adapterPost: AdapterPost): ViewPost {
  return {
    msg: adapterPost.getResponse().doc.msg,
    reactions: adapterPost.getResponse().doc.reactions,
    extensions: adapterPost.getResponse().doc.extensions,
    createdUser: adapterPost.getResponse().meta.createdBy,
    postTime: adapterPost.getResponse().meta.createdAt,
    children: new Array<ViewPost>(),
    path: adapterPost.getResponse().path,
    parent: adapterPost.getParentName(),
    postIdx: adapterPost.getPostIndex()
  };
}
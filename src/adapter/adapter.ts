import { ModelChannel } from "../model/channel";
import { getModel } from "../model/model";
import { CreateResponse } from "../../types/createResponse";
import { ModelWorkspace } from "../model/workspace";
import { slog } from "../slog";
import { CreatePostEvent, ViewPostUpdate } from "../view/datatypes";
import { getView } from "../view/view";
import { ModelPost } from "../model/post";
import { AdapterPost } from "./adapterPost";
import { insertPostSorted } from "./handleSortingPosts";
import { adapterViewPostConverter } from "./init";

// The Adapter has functions that the view can use to manipulate
// the state of the application.
class Adapter {
  private openWorkspace: ModelWorkspace | null = null;

  private openChannel: ModelChannel | null = null;

  private adapterPosts: Map<string, AdapterPost> = new Map<string, AdapterPost>();

  private rootAdapterPosts: Array<AdapterPost> = new Array<AdapterPost>();

  getOpenWorkspace(): ModelWorkspace | null {
    return this.openWorkspace;
  }

  async setOpenWorkspace(workspaceName: string): Promise<ModelWorkspace> {
    // Don't do anything if it's the same workspace.
    if (this.openWorkspace?.path.slice(1) === workspaceName) {
      return this.openWorkspace;
    }
    if (this.openWorkspace != null) {
      // TODO unsubscribe from old workspace
      // this.openWorkspace.unsubscribe()
    }
    this.openWorkspace = await getModel().getWorkspace(workspaceName);
    // TODO: subscribe to this workspace
    // this.openWorkspace.subscribe()
    // Display the new open workspace.
    getView().displayOpenWorkspace({
      name: this.openWorkspace.path.slice(1),
    });
    // Un-select the open channel.
    this.setOpenChannel(null);
    return this.openWorkspace;
  }

  getOpenChannel(): ModelChannel | null {
    return this.openChannel;
  }

  async setOpenChannel(
    channelName: string | null
  ): Promise<ModelChannel | null> {
    if (this.openChannel != null) {
      // TODO unsubscribe from old channel
      this.openChannel.unsubscribe();
    }
    if (channelName == null) {
      this.openChannel = null;
      getView().displayOpenChannel(null);
      return null;
    }
    let ws = this.getOpenWorkspace();
    if (ws != null) {
      this.openChannel = await ws.getChannel(channelName);
      // TODO: subscribe to this channel
      this.openChannel.subscribeToPosts();
      getView().displayOpenChannel({
        name: this.openChannel.path.split("/")[3],
      });
      return this.openChannel;
    } else {
      throw new Error("Cannot get open channel: no open workspace");
    }
  }

  createPost(postData: CreatePostEvent) {
    // TODO: consider if we want to enforce that a channel are open in order to send a message?
    let channel = this.getOpenChannel();
    if (channel === null) {
      throw new Error("Cannot add a post: no open channel");
    }
    channel
      .createPost(postData.msg, postData.parent, channel.path)
      .then((result: CreateResponse) => {
        slog.info("createPost: added to the database");
      })
      .catch((error: unknown) => {
        // TODO: notify view that their post failed for whatever reason.
        throw Error("createPost: creating the post failed");
      });
  }

  updateModelPost(modelPost: ModelPost) {
    slog.info("updateModelPost: top of func call", ["this.adapterPosts", `${JSON.stringify(Object.fromEntries(this.adapterPosts))}`], ["this.rootAdapterPosts", `${JSON.stringify(this.rootAdapterPosts)}`]);
    let postName = modelPost.getName();
    let existingAdapterPost = this.adapterPosts.get(postName);
    if (existingAdapterPost !== undefined) {
      // already exists. just a reaction thingy.
    } else {
      let newAdapterPost = new AdapterPost(modelPost.getResponse());
      this.insertAdapterPost(newAdapterPost);
    }
  }

  insertAdapterPost(adapterPost: AdapterPost) {
    let parentPost = this.adapterPosts.get(adapterPost.getParentName());
    let insertedIdx = -1;
    if (parentPost !== undefined) {
      insertedIdx = parentPost.addChildPost(adapterPost);
    } else {
      insertedIdx = this.insertRootAdapterPost(adapterPost);
    }
    if (insertedIdx === -1) {
      slog.error("insertAdapterPost", ["insertedIdx is -1", `${insertedIdx}`])
    }
    this.adapterPosts.set(adapterPost.getName(), adapterPost);
    adapterPost.setPostIndex(insertedIdx);
    let viewPost = adapterViewPostConverter(adapterPost);
    let updatedPost: ViewPostUpdate = {
      allPosts: [],
      op: "insert",
      affectedPosts: [viewPost]
    }
    getView().displayPosts(updatedPost);
  }

  insertRootAdapterPost(adapterPost: AdapterPost) {
    // binary search
    return insertPostSorted(this.rootAdapterPosts, adapterPost);
  }
}

// adapter singleton
let adapter = new Adapter();
function getAdapter() {
  return adapter;
}

export default getAdapter;

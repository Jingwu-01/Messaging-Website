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
import { PostResponse } from "../../types/postResponse";

// The Adapter has functions that the view can use to manipulate
// the state of the application.
class Adapter {
  private openWorkspace: ModelWorkspace | null = null;

  private openChannel: ModelChannel | null = null;

  private openWorkspaceName: string | null = null;

  private openChannelName: string | null = null;

  private adapterPosts: Map<string, AdapterPost> = new Map<string, AdapterPost>();

  private pendingPosts: Map<string, Array<AdapterPost>> = new Map<string, Array<AdapterPost>>();

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
    // need to handle this exception
    this.openWorkspace = await getModel().getWorkspace(workspaceName);
    this.openWorkspaceName = workspaceName;
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
      this.openChannelName = null;
      getView().displayOpenChannel(null);
      return null;
    }
    let ws = this.getOpenWorkspace();
    if (ws != null) {
      this.openChannel = await ws.getChannel(channelName);
      // TODO: subscribe to this channel
      this.openChannel.subscribeToPosts();
      this.openChannelName = channelName;
      getView().displayOpenChannel({
        name: this.openChannel.path.split("/")[3],
      });
      return this.openChannel;
    } else {
      throw new Error("Cannot get open channel: no open workspace");
    }
  }

  getOpenWorkspaceName() {
    return this.openWorkspaceName;
  }

  getOpenChannelName() {
    return this.openChannelName;
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

  serializePostResponse(response: PostResponse): [boolean, string] {

    slog.info("serializePostResponse", ["this.adapterPosts", this.adapterPosts], ["response", response]);
    let newPost: AdapterPost;
    try {
      newPost = new AdapterPost(response);
    } catch (error) {
      return [false, (error as Error).message];
    }
    let postIsAlive = this.verifyAlivePost(newPost);
    let exists: boolean;
    if (!postIsAlive[0]) {
      return [false, postIsAlive[1]];
    }
    let postName = newPost.getName();
    let parentName = newPost.getParentName();
    if (this.adapterPosts.get(newPost.getName()) !== undefined) {
      exists = true;
    } else {
      exists = false
    }
    if (newPost.getParentName() === "") {
      this.adapterPosts.set(postName, newPost);
      this.updateAdapterPost(newPost, exists);
      this.addPendingPosts(postName, newPost);
      return [true, "successfully added root level post"];
    }
    let parentPost = this.adapterPosts.get(parentName);
    if (parentPost === undefined) {
      slog.info("serializePostResponse", ["parentPost is undefined", ""]);
      let parentPendingPosts = this.pendingPosts.get(parentName);
      let postAlreadyPending: boolean = false;
      if (parentPendingPosts === undefined) {
        parentPendingPosts = new Array<AdapterPost>();
      }
      for (let pendingPost of parentPendingPosts) {
        if (pendingPost.getName() === postName) {
          postAlreadyPending = true;
          break;
        }
      }
      if (!postAlreadyPending) {
        parentPendingPosts.push(newPost);
      }
      this.pendingPosts.set(parentName, parentPendingPosts);
      return [true, "parent post isn't yet defined, so the post is pending"];
    }
    this.adapterPosts.set(postName, newPost);
    this.updateAdapterPost(newPost, exists);
    this.addPendingPosts(postName, newPost);
    return [true, "added post, parent exists"];
  }

  addPendingPosts(addedPostName: string, addedPost: AdapterPost) {
    slog.info("addPendingPosts: called", ["addedPostName", addedPostName], ["addedPost", addedPost]);
    let parentPendingPosts = this.pendingPosts.get(addedPostName);
    if (parentPendingPosts === undefined) {
      return;
    }
    parentPendingPosts.forEach((pendingPost: AdapterPost) => {
      this.adapterPosts.set(pendingPost.getName(), pendingPost);
      this.updateAdapterPost(pendingPost, false);
      this.addPendingPosts(pendingPost.getName(), pendingPost);
    });
    this.pendingPosts.delete(addedPostName);
  }

  verifyAlivePost(newPost: AdapterPost): [boolean, string] {
    let postWorkspace = newPost.getWorkspaceName();
    let postChannel = newPost.getChannelName();
    if (postWorkspace !== getAdapter().getOpenWorkspaceName()) {
      return [false, "post workspace is invalid"];
    }
    if (postChannel !== getAdapter().getOpenChannelName()) {
      return [false, "post channel is invalid"];
    }
    return [true, ""];
  }

  updateAdapterPost(adapterPost: AdapterPost, exists: boolean) {
    slog.info("updateModelPost: top of func call", ["this.adapterPosts", `${JSON.stringify(Object.fromEntries(this.adapterPosts))}`], ["this.rootAdapterPosts", `${JSON.stringify(this.rootAdapterPosts)}`]);
    this.upsertAdapterPost(adapterPost, exists);
    slog.info("updateModelPost: bottom of func call", ["this.adapterPosts", `${JSON.stringify(Object.fromEntries(this.adapterPosts))}`], ["this.rootAdapterPosts", `${JSON.stringify(this.rootAdapterPosts)}`]);
  }

  upsertAdapterPost(adapterPost: AdapterPost, exists: boolean) {
    let parentPost = this.adapterPosts.get(adapterPost.getParentName());
    let insertedIdx = -1;
    if (parentPost !== undefined) {
      insertedIdx = parentPost.addChildPost(adapterPost, exists);
    } else {
      insertedIdx = this.insertRootAdapterPost(adapterPost, exists);
    }
    if (insertedIdx === -1) {
      slog.error("upsertAdapterPost", ["insertedIdx is -1", `${insertedIdx}`])
    }
    adapterPost.setPostIndex(insertedIdx);
    let op: "insert" | "modify";
    if (exists) {
      op = "modify";
    } else {
      op = "insert";
    }
    let viewPost = adapterViewPostConverter(adapterPost);
    let updatedPost: ViewPostUpdate = {
      allPosts: [],
      op: op,
      affectedPosts: [viewPost]
    }
    getView().displayPosts(updatedPost);
  }

  insertRootAdapterPost(adapterPost: AdapterPost, exists: boolean) {
    // binary search
    return insertPostSorted(this.rootAdapterPosts, adapterPost, exists);
  }
}

// adapter singleton
let adapter = new Adapter();
function getAdapter() {
  return adapter;
}

export default getAdapter;

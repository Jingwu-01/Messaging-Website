import { ModelChannel } from "../model/channel";
import { getModel } from "../model/model";
import { CreateResponse } from "../../types/createResponse";
import { ModelWorkspace } from "../model/workspace";
import { slog } from "../slog";
import { CreatePostEvent } from "../view/datatypes";
import { getView } from "../view/view";
import { PostsManager } from "./postsManager";
import { PostResponse } from "../../types/postResponse";

// The state manager stores the state of the application
// and has functions that the adapter can call to manipulate that state.
// It interfaces with the Model.
class StateManager {
  private openWorkspace: ModelWorkspace | null = null;

  private openChannel: ModelChannel | null = null;

  private openWorkspaceName: string | null = null;

  private openChannelName: string | null = null;

  private postsManager: PostsManager = new PostsManager();

  getOpenWorkspace(): ModelWorkspace | null {
    return this.openWorkspace;
  }

  async setOpenWorkspace(
    workspaceName: string | null,
  ): Promise<ModelWorkspace | null> {
    // Close workspace if we passed a null.
    if (workspaceName == null) {
      this.openWorkspace = null;
      await this.setOpenChannel(null);
      getView().displayOpenWorkspace(null);
      return null;
    }
    // Don't do anything if it's the same workspace.
    if (this.openWorkspace?.getName() === workspaceName) {
      return this.openWorkspace;
    }
    this.openWorkspace = await getModel().getWorkspace(workspaceName);
    this.openWorkspaceName = workspaceName;
    // Un-select the open channel.
    await this.setOpenChannel(null);
    // Display the new open workspace.
    getView().displayOpenWorkspace({
      name: this.openWorkspace.getName(),
    });
    return this.openWorkspace;
  }

  getOpenChannel(): ModelChannel | null {
    return this.openChannel;
  }

  async setOpenChannel(
    channelName: string | null,
  ): Promise<ModelChannel | null> {
    // Unsub from old channel
    if (this.openChannel != null) {
      this.openChannel.unsubscribe();
      this.resetPostsManager();
    }
    if (channelName == null) {
      this.openChannel = null;
      this.openChannelName = null;
      getView().displayOpenChannel(null);
      getView().removePostDisplay();
      return null;
    }
    let ws = this.getOpenWorkspace();
    if (ws != null) {
      this.openChannel = await ws.getChannel(channelName);
      this.openChannel.subscribeToPosts();
      this.openChannelName = channelName;
      getView().displayOpenChannel({
        name: this.openChannel.getName(),
      });
      getView().displayPostDisplay();
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

  getOpenWorkspaceName() {
    return this.openWorkspaceName;
  }

  getOpenChannelName() {
    return this.openChannelName;
  }

  serializePostResponse(response: PostResponse) {
    this.postsManager.serializePostResponse(response);
  }

  resetPostsManager() {
    this.postsManager = new PostsManager();
  }
}

// state manager
let stateManager = new StateManager();
function getStateManager() {
  return stateManager;
}

export default getStateManager;

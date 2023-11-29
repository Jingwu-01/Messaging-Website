import { ModelChannel } from "../model/channel";
import { getModel } from "../model/model";
import { CreateResponse } from "../../types/createResponse";
import { ModelWorkspace } from "../model/workspace";
import { slog } from "../slog";
import { CreatePostEvent } from "../view/datatypes";
import { getView } from "../view/view";

// The Adapter has functions that the view can use to manipulate
// the state of the application.
class Adapter {
  private openWorkspace: ModelWorkspace | null = null;

  private openChannel: ModelChannel | null = null;

  getOpenWorkspace(): ModelWorkspace | null {
    return this.openWorkspace;
  }

  async setOpenWorkspace(
    workspaceName: string | null
  ): Promise<ModelWorkspace | null> {
    // open
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
    // Un-select the open channel.
    await this.setOpenChannel(null);
    // Display the new open workspace.
    getView().displayOpenWorkspace({
      name: this.openWorkspace.path.slice(1),
    });
    return this.openWorkspace;
  }

  getOpenChannel(): ModelChannel | null {
    return this.openChannel;
  }

  async setOpenChannel(
    channelName: string | null
  ): Promise<ModelChannel | null> {
    // Unsub from old channel
    if (this.openChannel != null) {
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
      this.openChannel.subscribeToPosts();
      getView().displayOpenChannel({
        name: this.openChannel.getName(),
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
}

// adapter singleton
let adapter = new Adapter();
function getAdapter() {
  return adapter;
}

export default getAdapter;

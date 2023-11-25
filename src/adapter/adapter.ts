import { ModelChannel } from "../model/channel";
import { getModel } from "../model/model";
import { PostDocumentResponse } from "../model/responseTypes";
import { ModelWorkspace } from "../model/workspace";
import { slog } from "../slog";
import { CreatePostEvent, ViewChannel } from "../view/datatypes";
import { getView } from "../view/view";

// The Adapter has functions that the view can use to manipulate
// the state of the application.
class Adapter {
  private openWorkspace: ModelWorkspace | null = null;

  private openChannel: ModelChannel | null = null;

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
    channel.createPost(postData.msg, postData.parent, channel.path)
    .then((result: PostDocumentResponse) => {
      slog.info("createPost: added to the database");
    })
    .catch((error: unknown) => {
      // TODO: notify view that their post failed for whatever reason.
      throw Error("createPost: creating the post failed");
    });
  }

  // async reRenderWorkspaces(listener: WorkspaceListener) {
  //   listener.displayOpenWorkspace({
  //     name: this.openWorkspace?.path.slice(1) ?? "Select Workspace",
  //   });
  //   let workspaces = await getModel().getAllWorkspaces();
  //   let viewWorkspaceArr: Array<ViewWorkspace> = new Array<ViewWorkspace>();
  //   workspaces.forEach((workspace) => {
  //     viewWorkspaceArr.push({
  //       name: workspace.path.slice(1),
  //     });
  //   });
  //   listener.displayWorkspaces(viewWorkspaceArr);
  // }

  async displayViewChannels() {
    let viewChannelArr = new Array<ViewChannel>();
    this.openWorkspace?.getAllChannels().then((modelChannels) => {
      modelChannels.forEach((modelChannel) => {
        slog.info("displayViewChannels", [
          "viewChannel name",
          modelChannel.path.split("/")[3],
        ]);
        viewChannelArr.push({
          name: modelChannel.path.split("/")[3],
        });
      });
      getView().displayChannels(viewChannelArr);
    });
  }
}

// adapter singleton
let adapter = new Adapter();
function getAdapter() {
  return adapter;
}

export default getAdapter;

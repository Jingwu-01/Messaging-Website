import { ModelChannel } from "../model/channel";
import { getModel } from "../model/model";
import { ModelWorkspace } from "../model/workspace";
import { slog } from "../slog";
import { ViewChannel, ViewWorkspace } from "../view/datatypes";
import { getView } from "../view/view";
import { WorkspaceListener } from "./adapterTypes";

// The Adapter has functions that the view can use to manipulate
// the state of the application.
class Adapter {
  private openWorkspace: ModelWorkspace | null = null;

  private openChannel: ModelChannel | null = null;

  getOpenWorkspace(): ModelWorkspace | null {
    return this.openWorkspace;
  }

  async setOpenWorkspace(workspaceName: string): Promise<ModelWorkspace> {
    if (this.openWorkspace != null) {
      // TODO unsubscribe from old workspace
      // this.openWorkspace.unsubscribe()
    }
    this.openWorkspace = await getModel().getWorkspace(workspaceName);
    // TODO: subscribe to this workspace
    // this.openWorkspace.subscribe()
    getView().displayOpenWorkspace({
      name: this.openWorkspace.path.slice(1),
    });
    return this.openWorkspace;
  }

  getOpenChannel(): ModelChannel | null {
    return this.openChannel;
  }

  async setOpenChannel(channelName: string): Promise<ModelChannel> {
    if (this.openChannel != null) {
      // TODO unsubscribe from old channel
      // this.openChannel.unsubscribe()
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

  async reRenderWorkspaces(listener: WorkspaceListener) {
    listener.displayOpenWorkspace({
      name: this.openWorkspace?.path.slice(1) ?? "Select Workspace",
    });
    let workspaces = await getModel().getAllWorkspaces();
    let viewWorkspaceArr: Array<ViewWorkspace> = new Array<ViewWorkspace>();
    workspaces.forEach((workspace) => {
      viewWorkspaceArr.push({
        name: workspace.path.slice(1),
      });
    });
    listener.displayWorkspaces(viewWorkspaceArr);
  }

  async displayViewChannels() {
    let viewChannelArr = new Array<ViewChannel>();
    this.openWorkspace?.getAllChannels().then((modelChannels) => {
      modelChannels.forEach((modelChannel) => {
        slog.info("displayViewChannels", ["viewChannel name", modelChannel.path.split("/")[3]]);
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

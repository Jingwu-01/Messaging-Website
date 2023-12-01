import { ModelChannel } from "../model/channel";
import { getModel } from "../model/model";
import { CreateResponse } from "../../types/createResponse";
import { ModelWorkspace } from "../model/workspace";
import { slog } from "../slog";
import { CreatePostEvent } from "../view/datatypes";
import { getView } from "../view/view";

// The state manager stores the state of the application
// and has functions that the adapter can call to manipulate that state.
// It interfaces with the Model.
class StateManager {
  private openWorkspace: ModelWorkspace | null = null;

  private openChannel: ModelChannel | null = null;

  getOpenWorkspace(): ModelWorkspace | null {
    return this.openWorkspace;
  }

  async setOpenWorkspace(
    workspaceName: string | null
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
}

// state manager
let stateManager = new StateManager();
function getStateManager() {
  return stateManager;
}

export default getStateManager;

import { ModelChannel } from "./channel";
import { getModel } from "./model";
import { WorkspaceResponse } from "./responseTypes";
import { getDatabasePath } from "./utils";

// got rid of typed fetch from imports in utils

export class ModelWorkspace {
  path: string;
  channels: Map<string, ModelChannel> = new Map<string, ModelChannel>();
  subscribedToChannels: boolean = false;

  constructor(res: WorkspaceResponse) {
    this.path = res.path;
  }

  async getChannel(id: string): Promise<ModelChannel> {
    // Get logged in user
    let existingChannel = this.channels.get(id);
    if (existingChannel) {
      return existingChannel;
    } else {
      let freshChannel = new ModelChannel(
        await getModel().typedModelFetch(`${this.path}/channels/${id}`, {
          headers: {
            accept: "application/json",
          },
        })
      );
      this.channels.set(id, freshChannel);
      return freshChannel;
    }
  }

  async getAllChannels(): Promise<Map<string, ModelChannel>> {
    // Update channels, if we aren't subscribed
    if (!this.subscribedToChannels) {
      this.channels = new Map<string, ModelChannel>();
      let db_channels = await getModel().typedModelFetch<WorkspaceResponse[]>(
        `${getDatabasePath()}/`
      );
      db_channels.forEach((channel_response) => {
        let split_path = channel_response.path.split("/");
        let workspace_name = split_path[split_path.length - 1];
        this.channels.set(workspace_name, new ModelChannel(channel_response));
      });
    }
    return this.channels;
  }
}

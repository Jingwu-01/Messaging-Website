import { slog } from "../slog";
import { ModelChannel } from "./channel";
import { getModel } from "./model";
import { WorkspaceResponse } from "../../types/workspaceResponse";
import { getDatabasePath, validateChannelResponse, validateGetChannelsResponse } from "./utils";
import { ChannelResponse } from "../../types/channelResponse";
import { GetChannelsResponse } from "../../types/getChannelsResponse";

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
      const response = await getModel().typedModelFetch<ChannelResponse>(`${this.path}/channels/${id}`, {
        headers: {
          accept: "application/json",
        },
      });
      const valid = validateChannelResponse(response);
      if (!valid) {
        slog.error("getChannel", ["invalid channel response", `${validateChannelResponse.errors}`]);
        throw new Error("invalid channel response received from owldb");
      }
      let freshChannel = new ModelChannel(response);
      this.channels.set(id, freshChannel);
      return freshChannel;
    }
  }

  async getAllChannels(): Promise<Map<string, ModelChannel>> {
    // Update channels, if we aren't subscribed
    if (!this.subscribedToChannels) {
      this.channels = new Map<string, ModelChannel>();
      slog.info("getAllChannels", ["this.path", `${this.path}`]);
      let db_channels = await getModel().typedModelFetch<GetChannelsResponse>(
        `${this.path}/channels/`
      );
      const valid = validateGetChannelsResponse(db_channels);
      if (!valid) {
        slog.error("getAllChannels", ["invalid all channels response", `${validateGetChannelsResponse.errors}`]);
        throw new Error("invalid all channels response received from owldb");
      }
      db_channels.forEach((channel_response) => {
        let split_path = channel_response.path.split("/");
        let workspace_name = split_path[split_path.length - 1];
        this.channels.set(workspace_name, new ModelChannel(channel_response));
      });
    }
    slog.info("getAllChannels", ["this.channels", `${this.channels}`]);
    return this.channels;
  }

  async addChannel(channel_name: string): Promise<void> {
    // Add this channel under this workspace to the API
    await getModel().typedModelFetch<any>(`${this.path}/${channel_name}`, {
      method: "PUT",
    });
    // Now, either:
    // 1. we are subscribed to channels, so OWLDB will send back a message which updates the state
    // or:
    // 2. we aren't subscribed, in which case the adapter will manually refresh, if it wants to.
    // Either way, we don't have to do anything else.
  }

  async removeChannel(channel_name: string): Promise<void> {
    await getModel().typedModelFetch<any>(`${this.path}/${channel_name}`, {
      method: "DELETE",
    });
  }
}

/**
 * The model's representation of a workspace.
 */
import { ModelChannel } from "./channel";
import { getModel } from "./model";
import { WorkspaceResponse } from "../../types/workspaceResponse";
/**
 * A class representing the model's representation of a workspace.
 */
export class ModelWorkspace {
  /** path of this workspace */
  path: string;

  /**
   * Constructs a new ModelWorkspace based on the received WorkspaceResponse
   * @param res workspaceResponce received from an OwlDB workspace fetch.
   */
  constructor(res: WorkspaceResponse) {
    this.path = res.path;
  }

  /**
   * Gets the channel, an asynchronous operation that resolves to a ModelChannel.
   * @param id the string id of this channel
   * @retuns a Promise resolving to a ModelChannel
   */
  async getChannel(id: string): Promise<ModelChannel> {
    return getModel().getChannel(`${this.path}/channels/${id}`);
  }

  /**
   * Returns all channels in this workspace via a map as a promise.
   * @returns a map of channel names to ModelChannels
   */
  async getAllChannels(): Promise<Map<string, ModelChannel>> {
    return getModel().getAllChannels(this.path);
  }

  /**
   * Adds a channel with the specified name to the workspace.
   * @param channel_name the string name of the channel
   * @returns an empty promise representing the result of waiting on the database requests.
   */
  async addChannel(channel_name: string): Promise<void> {
    return getModel().addChannel(`${this.path}/channels/${channel_name}`);
  }

  /**
   * Removes the channel with the specified name
   * @param channel_name
   * @returns
   */
  async removeChannel(channel_name: string): Promise<void> {
    return getModel().removeChannel(`${this.path}/channels/${channel_name}`);
  }

  /**
   * Gets the name of this workspace.
   * @returns a string representing the name of this workspace.
   */
  getName() {
    return this.path.slice(1);
  }
}

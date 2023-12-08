import { ModelInterface, StateManagerInterface, ViewInterface } from "../../interfaces";
import { slog } from "../../slog";
import { CreateChannelEvent, DeleteChannelEvent, RefreshChannelsEvent, SelectChannelEvent } from "../../view/datatypes";
import { modelToViewChannels } from "../utils";

export class ChannelsAdapter {
    private view: ViewInterface;
    private model: ModelInterface;
    private stateManager: StateManagerInterface;

    constructor(view: ViewInterface, model: ModelInterface, stateManager: StateManagerInterface) {
        this.view = view;
        this.model = model;
        this.stateManager = stateManager;
    }

    getView(): ViewInterface {
        return this.view;
    }

    getModel(): ModelInterface {
        return this.model;
    }

    getStateManager(): StateManagerInterface {
        return this.stateManager;
    }

    async selectChannel(evt: CustomEvent<SelectChannelEvent>) {
        slog.info("initChannels", ["Channel Selected", `${evt.detail.name}`]);
        this.getView().setStateLoadingUntil(["posts", "channels", "workspaces"], evt);
        try {
          await this.getStateManager().setOpenChannel(evt.detail.name);
        } catch (err) {
          slog.error("Setting open channel error:", ["err", err]);
          this.getView().failEvent(evt, "Failed to select channel");
        }
        this.getView().completeEvent(evt);
    }

    async createChannel(evt: CustomEvent<CreateChannelEvent>) {
        slog.info(`Channel Created: ${evt.detail.name}`);
        this.getView().setStateLoadingUntil(["workspaces", "channels", "posts"], evt);
        // Add the channel
        try {
            await this.getStateManager().getOpenWorkspace()?.addChannel(evt.detail.name);
        } catch {
            this.getView().failEvent(evt, "Failed to add channel");
            return;
        }
    
        try {
            await this.refreshChannels(evt);
        } catch (err) {
            this.getView().failEvent(evt, "Failed to refresh channels");
            return;
        }
        this.getView().completeEvent(evt);
    }

    async refreshChannelsEvent(evt: CustomEvent<RefreshChannelsEvent>) {
        slog.info(`Workspaces refreshed`);
        this.getView().setStateLoadingUntil(["channels", "posts", "workspaces"], evt);
        try {
          await this.refreshChannels(evt);
        } catch (error) {
          this.getView().failEvent(evt, "Failed to refresh channels");
          return;
        }
        this.getView().completeEvent(evt);
    }

    async refreshChannels(evt: Event) {
        // Refresh the channels in the model
        const channels = await this.getStateManager().getOpenWorkspace()?.getAllChannels();
        // The user should never be able to trigger this.
        if (!channels) {
            throw new Error(
            "Tried to add a channel without a workspace currently open"
            );
        }
        // Close the open channel if it doesn't exist anymore.
        let open_channel_name = this.getStateManager().getOpenChannel()?.getName();
        if (open_channel_name && !channels.has(open_channel_name)) {
            // TODO: await this?
            this.getStateManager().setOpenChannel(null);
        }
        // Tell the view that this was a success.
        this.getView().displayChannels({
            allChannels: modelToViewChannels(channels),
            op: "replace",
            affectedChannels: modelToViewChannels(channels),
        });
    }

    async deleteChannel(evt: CustomEvent<DeleteChannelEvent>) {
        slog.info(`Channel Deleted: ${evt.detail.name}`);
        this.getView().setStateLoadingUntil(["channels", "posts", "workspaces"], evt);
  
        // Try to remove the channel
        try {
          await this.getStateManager()
            .getOpenWorkspace()
            ?.removeChannel(evt.detail.name);
        } catch (err) {
          this.getView().failEvent(evt, "Failed to remove channel");
          return;
        }
        try {
          await this.refreshChannels(evt);
        } catch (err) {
          this.getView().failEvent(evt, "Failed to refresh channels");
          return;
        }
        this.getView().completeEvent(evt);
    }

    initChannels() {
        // handle channel select
        document.addEventListener("channelSelected", 
        this.selectChannel.bind(this));

        // Handle channel creation
        document.addEventListener("channelCreated", 
        this.createChannel.bind(this));

        // Handle channel deletion
        document.addEventListener("channelDeleted",
        this.deleteChannel.bind(this));

        // Handle channel refresh
        document.addEventListener("refreshChannels",
        this.refreshChannelsEvent.bind(this));

    }
}
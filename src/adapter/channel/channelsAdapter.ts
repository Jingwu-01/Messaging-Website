import {
  ModelInterface,
  StateManagerInterface,
  ViewInterface,
} from "../../interfaces";
import { slog } from "../../slog";
import {
  CreateChannelEvent,
  DeleteChannelEvent,
  RefreshChannelsEvent,
  SelectChannelEvent,
} from "../../view/datatypes";
import { modelToViewChannels } from "../utils";

/**
 * This adapter handles any updates to the channels from the view by making requests to the model, and then
 * stores the updated state in the state manager. It also updates the view based on the updated data received.
 */
export class ChannelsAdapter {
  // References the view interface which displays updated changes.
  private view: ViewInterface;
  // References the model interface which this adapter makes requests to.
  private model: ModelInterface;
  // References the state manager interface which this adapter stores information in.
  private stateManager: StateManagerInterface;

  /**
   * Creates a channels adapter by injecting a view, model, and state manager interface.
   * @param view the view interface to display updated changes
   * @param model the model interface which this adapter makes requests to
   * @param stateManager the state manager interface which this adapter stores information in
   */
  constructor(
    view: ViewInterface,
    model: ModelInterface,
    stateManager: StateManagerInterface,
  ) {
    this.view = view;
    this.model = model;
    this.stateManager = stateManager;
  }

  /**
   * Returns a view interface which this adapter updates.
   * @returns a ViewInterface to receive updates in the view
   */
  getView(): ViewInterface {
    return this.view;
  }

  /**
   * Returns a model interface which this adapter makes requests to for data.
   * @returns a ModelInterface which this adapter makes requests to
   */
  getModel(): ModelInterface {
    return this.model;
  }

  /**
   * Returns a state manager interface which this adapter stores and retrieves data from.
   * @returns a StateManagerInterface storing data
   */
  getStateManager(): StateManagerInterface {
    return this.stateManager;
  }

  /**
   * Receives an event from the view that a channel is selected, and sets the open
   * channel in the state manager. Updates the view based on whether or not
   * the channel is successfully selected.
   * @param evt a CustomEvent containing the name of the channel that is selected
   */
  async selectChannel(evt: CustomEvent<SelectChannelEvent>) {
    slog.info("initChannels", ["Channel Selected", `${evt.detail.name}`]);
    this.getView().setStateLoadingUntil(
      ["posts", "channels", "workspaces"],
      evt,
    );
    try {
      await this.getStateManager().setOpenChannel(evt.detail.name);
    } catch (err) {
      slog.error("Setting open channel error:", ["err", err]);
      this.getView().failEvent(evt, "Failed to select channel");
    }
    this.getView().completeEvent(evt);
  }

  /**
   * Receives an event from the view that a channel is created, and makes a corresponding request
   * to the model to create the channel with the given name. Either adds the channel to the view, or
   * displays an error if the operation is unsuccessful.
   *
   * @param evt a CustomEvent containing the name of the channel to create
   * @returns nothing; updates the view to add the channel or displays an error
   */
  async createChannel(evt: CustomEvent<CreateChannelEvent>) {
    slog.info(`Channel Created: ${evt.detail.name}`);
    // Add the channel
    try {
      await this.getStateManager()
        .getOpenWorkspace()
        ?.addChannel(evt.detail.name);
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

  /**
   * Receives an event from the view to refresh the channels. Either updates the view with the refreshed channels
   * or displays an error.
   * @param evt an event from the view with an ID, representing whether or not to refresh the channels
   * @returns nothing (requests for the channels from the model, and updates the view accordingly)
   */
  async refreshChannelsEvent(evt: CustomEvent<RefreshChannelsEvent>) {
    slog.info(`Workspaces refreshed`);
    this.getView().setStateLoadingUntil(["channels"], evt);
    try {
      await this.refreshChannels(evt);
    } catch (error) {
      this.getView().failEvent(evt, "Failed to refresh channels");
      return;
    }
    this.getView().completeEvent(evt);
  }

  /**
   * Retrieves all channels in the currently opened workspace, closing the open channel if it doesn't exist anymore.
   * Displays all updated channels to the view.
   * @param evt an event from the view
   */
  async refreshChannels(evt: Event) {
    // Refresh the channels in the model
    const channels = await this.getStateManager()
      .getOpenWorkspace()
      ?.getAllChannels();
    // The user should never be able to trigger this.
    if (!channels) {
      throw new Error(
        "Tried to add a channel without a workspace currently open",
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

  /**
   * Calls the state manager to delete the channel with the specified name and updates the view accordingly,
   * unselecting the currently opened channel if the deleted channel is currently open.
   * @param evt an event containing the name of the channel to delete, as well as its ID
   * @returns nothing (deletes the channel from the view and unselects the opened channel, or displays an error)
   */
  async deleteChannel(evt: CustomEvent<DeleteChannelEvent>) {
    slog.info(`Channel Deleted: ${evt.detail.name}`);
    this.getView().setStateLoadingUntil(["channels"], evt);

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

  /**
   * Initializes the event listeners for events from the view.
   */
  initChannels() {
    // handle channel select
    document.addEventListener("channelSelected", this.selectChannel.bind(this));

    // Handle channel creation
    document.addEventListener("channelCreated", this.createChannel.bind(this));

    // Handle channel deletion
    document.addEventListener("channelDeleted", this.deleteChannel.bind(this));

    // Handle channel refresh
    document.addEventListener(
      "refreshChannels",
      this.refreshChannelsEvent.bind(this),
    );
  }
}

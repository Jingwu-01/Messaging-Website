import { slog } from "../../slog";
import {
  CreateChannelEvent,
  DeleteChannelEvent,
  RefreshChannelsEvent,
  SelectChannelEvent,
} from "../../view/datatypes";
import { getView } from "../../view/view";
import getStateManager from "../../state-manager";
import refreshChannels from "./refreshChannels";

/**
 * Initializes event handlers for the channels
 */
export function initChannels() {
  // Handle channel select
  document.addEventListener(
    "channelSelected",
    async function (evt: CustomEvent<SelectChannelEvent>) {
      slog.info("initChannels", ["Channel Selected", `${evt.detail.name}`]);
      try {
        await getStateManager().setOpenChannel(evt.detail.name);
      } catch (err) {
        getView().failEvent(evt, "Failed to select channel");
      }
      getView().completeEvent(evt);
    },
  );

  // Handle channel creation
  document.addEventListener(
    "channelCreated",
    async (evt: CustomEvent<CreateChannelEvent>) => {
      slog.info(`Channel Created: ${evt.detail.name}`);

      // Add the channel
      try {
        await getStateManager().getOpenWorkspace()?.addChannel(evt.detail.name);
      } catch {
        getView().failEvent(evt, "Failed to add channel");
        return;
      }

      try {
        await refreshChannels(evt);
      } catch (err) {
        getView().failEvent(evt, "Failed to refresh channels");
        return;
      }
      getView().completeEvent(evt);
    },
  );

  // Handle channel deletion
  document.addEventListener(
    "channelDeleted",
    async (evt: CustomEvent<DeleteChannelEvent>) => {
      slog.info(`Channel Deleted: ${evt.detail.name}`);
      // Close the open channel if we're removing it.
      if (evt.detail.name == getStateManager().getOpenChannel()?.getName()) {
        getStateManager().setOpenChannel(null);
      }

      // Try to remove the channel
      try {
        await getStateManager()
          .getOpenWorkspace()
          ?.removeChannel(evt.detail.name);
      } catch (err) {
        getView().failEvent(evt, "Failed to remove channel");
        return;
      }
      try {
        await refreshChannels(evt);
      } catch (err) {
        getView().failEvent(evt, "Failed to refresh channels");
        return;
      }
      getView().completeEvent(evt);
    },
  );

  //Handle channel refresh
  document.addEventListener(
    "refreshChannels",
    async (evt: CustomEvent<RefreshChannelsEvent>) => {
      slog.info(`Workspaces refreshed`);

      try {
        await refreshChannels(evt);
      } catch (error) {
        getView().failEvent(evt, "Failed to refresh channels");
        return;
      }
      getView().completeEvent(evt);
    },
  );
}

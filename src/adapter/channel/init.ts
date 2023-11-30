import { slog } from "../../slog";
import {
  CreateChannelEvent,
  DeleteChannelEvent,
  SelectChannelEvent,
} from "../../view/datatypes";
import { getView } from "../../view/view";
import getStateManager from "../../state-manager";
import refreshChannels from "./refreshChannels";

export function initChannels() {
  // Handle channel select
  document.addEventListener(
    "channelSelected",
    function (evt: CustomEvent<SelectChannelEvent>) {
      slog.info("initChannels", ["Channel Selected", `${evt.detail.name}`]);
      getStateManager().setOpenChannel(evt.detail.name);
    }
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
        getView().displayError("Failed to add channel");
      }

      await refreshChannels(evt);
      getView().completeEvent(evt);
    }
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
        if (err instanceof Error) {
          getView().displayError("Failed to remove channel");
        }
      }

      await refreshChannels(evt);
      getView().completeEvent(evt);
    }
  );
}

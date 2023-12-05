import { getView } from "../../view/view";
import getStateManager from "../../state-manager";
import modelToViewChannels from "./modelToViewChannels";

/**
 * Re-fetches the channels from the model then updates the view.
 * @param evt The event that triggered this refresh.
 */
export default async function refreshChannels(evt: Event) {
  // Refresh the channels in the model
  const channels = await getStateManager().getOpenWorkspace()?.getAllChannels();
  // The user should never be able to trigger this.
  if (!channels) {
    throw new Error(
      "Tried to add a channel without a workspace currently open"
    );
  }
  // Close the open channel if it doesn't exist anymore.
  let open_channel_name = getStateManager().getOpenChannel()?.getName();
  if (open_channel_name && !channels.has(open_channel_name)) {
    getStateManager().setOpenChannel(null);
  }
  // Tell the view that this was a success.
  getView().displayChannels({
    allChannels: modelToViewChannels(channels),
    op: "replace",
    affectedChannels: modelToViewChannels(channels),
    cause: evt,
  });
}

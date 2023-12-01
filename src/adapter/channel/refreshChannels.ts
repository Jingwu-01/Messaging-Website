import { getView } from "../../view/view";
import getStateManager from "../../state-manager";
import modelToViewChannels from "./modelToViewChannels";

export default async function refreshChannels(evt: Event) {
  // Refresh the channels
  try {
    const channels = await getStateManager()
      .getOpenWorkspace()
      ?.getAllChannels();
    // The user should never be able to trigger this.
    if (!channels) {
      throw new Error(
        "Tried to add a channel without a workspace currently open",
      );
    }
    // Tell the view that this was a success.
    getView().displayChannels({
      allChannels: modelToViewChannels(channels),
      op: "replace",
      affectedChannels: modelToViewChannels(channels),
      cause: evt,
    });
  } catch (error) {
    getView().displayError("Failed to refresh channels");
  }
}

import { slog } from "../../slog";
import {
  CreateChannelEvent,
  DeleteChannelEvent,
  SelectChannelEvent,
} from "../../view/datatypes";
import { getView } from "../../view/view";
import getAdapter from "../adapter";
import modelToViewChannels from "./modelToViewChannels";

export function initChannels() {
  // Handle channel select
  document.addEventListener(
    "channelSelected",
    function (evt: CustomEvent<SelectChannelEvent>) {
      slog.info("initChannels", ["Channel Selected", `${evt.detail.name}`]);
      getAdapter().setOpenChannel(evt.detail.name);
    }
  );

  // Handle channel creation
  document.addEventListener(
    "channelCreated",
    async (evt: CustomEvent<CreateChannelEvent>) => {
      slog.info(`Channel Created: ${evt.detail.name}`);
      // TODO handle promise rejection
      await getAdapter().getOpenWorkspace()?.addChannel(evt.detail.name);
      const channels = await getAdapter().getOpenWorkspace()?.getAllChannels();
      if (!channels) {
        throw new Error(
          "Tried to add a channel without a workspace currently open"
        );
      }
      getView().displayChannels({
        allChannels: modelToViewChannels(channels),
        op: "replace",
        affectedChannels: modelToViewChannels(channels),
        cause: evt,
      });
      getView().completeEvent(evt);
    }
  );

  // Handle channel deletion
  document.addEventListener(
    "channelDeleted",
    async (evt: CustomEvent<DeleteChannelEvent>) => {
      slog.info(`Channel Deleted: ${evt.detail.name}`);
      // TODO handle promise rejection
      await getAdapter().getOpenWorkspace()?.removeChannel(evt.detail.name);
      const channels = await getAdapter().getOpenWorkspace()?.getAllChannels();
      if (!channels) {
        throw new Error(
          "Tried to remove a channel without a workspace currently open"
        );
      }
      getView().displayChannels({
        allChannels: modelToViewChannels(channels),
        op: "replace",
        affectedChannels: modelToViewChannels(channels),
        cause: evt,
      });
    }
  );
}

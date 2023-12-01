import EditDialogComponent from "..";
import {
  EventWithId,
  ViewChannel,
  ViewChannelUpdate,
} from "../../../../../datatypes";
import { getView } from "../../../../../view";

/**
 * EditDialog subclass that allows channels to be edited.
 */
export class EditChannelsDialogComponent extends EditDialogComponent {
  connectedCallback(): void {
    super.connectedCallback();
    let title = this.shadowRoot?.querySelector("#dialog-title");
    if (!title) {
      throw new Error("Could not find dialog title element");
    }
    title.innerHTML = "Edit Channels";
    getView().addChannelListener(this);
  }

  displayOpenChannel(channel: ViewChannel | null) {}

  displayChannels(update: ViewChannelUpdate) {
    this.setItems(update.allChannels.map((ch) => ch.name));
  }

  public getAddEvent(new_item_name: string): EventWithId {
    let event_id = String(Date.now());
    return new CustomEvent("channelCreated", {
      detail: {
        name: new_item_name,
        id: event_id,
      },
    });
  }

  public getRemoveEvent(channel_name: string) {
    let event_id = String(Date.now());
    return new CustomEvent("channelDeleted", {
      detail: {
        name: channel_name,
        id: event_id,
      },
    });
  }
}

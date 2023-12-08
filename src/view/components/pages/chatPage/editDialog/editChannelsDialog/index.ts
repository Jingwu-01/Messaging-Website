import EditDialogComponent from "..";
import {
  EventWithId,
  ViewChannel,
  ViewChannelUpdate,
} from "../../../../../datatypes";
import { getView } from "../../../../../view";

/**
 * EditDialog is a subclass that allows channels to be edited.
 */
export class EditChannelsDialogComponent extends EditDialogComponent {
  /**
   * When connected, show the edit channels text and add channel listener in the view.
   */
  connectedCallback(): void {
    super.connectedCallback();
    let title = this.shadowRoot?.querySelector("#dialog-title");
    if (!title) {
      throw new Error("Could not find dialog title element");
    }
    title.innerHTML = "Edit Channels";
    getView().addChannelListener(this);
  }

  /**
   * Display the open channel.
   * @param channel ViewChannel | null
   */
  displayOpenChannel(channel: ViewChannel | null) {}

  /**
   * Display the channels.
   * @param update ViewChannelUpdate
   */
  displayChannels(update: ViewChannelUpdate) {
    this.setItems(update.allChannels.map((ch) => ch.name));
  }

  /**
   * get the add channel event.
   * @param new_item_name string for new channel name
   * @returns EventWithId
   */
  public getAddEvent(new_item_name: string): EventWithId {
    let event_id = String(Date.now());
    return new CustomEvent("channelCreated", {
      detail: {
        name: new_item_name,
        id: event_id,
      },
    });
  }

  /**
   * get the remove channel event.
   * @param channel_name string for the channel
   * @returns EventWithId
   */
  public getRemoveEvent(channel_name: string): EventWithId {
    let event_id = String(Date.now());
    return new CustomEvent("channelDeleted", {
      detail: {
        name: channel_name,
        id: event_id,
      },
    });
  }
}

import EditDialogComponent from "..";
import { ViewChannel, ViewChannelUpdate } from "../../../../../datatypes";
import { getView } from "../../../../../view";

// Edit-dialog that allows user to edit workspaces
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

  public onAdd(new_item_name: string): void {
    document.dispatchEvent(
      new CustomEvent("channelCreated", {
        detail: {
          name: new_item_name,
        },
      })
    );
  }

  public onRemove(channel_name: string): void {
    document.dispatchEvent(
      new CustomEvent("channelDeleted", {
        detail: {
          name: channel_name,
        },
      })
    );
  }
}

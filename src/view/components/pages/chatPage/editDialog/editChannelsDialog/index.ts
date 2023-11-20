import EditDialogComponent from "..";
import { ViewChannel } from "../../../../../datatypes";
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

  displayOpenChannel(channel: ViewChannel) {}

  displayChannels(channels: Array<ViewChannel>) {
    this.setItems(channels.map((ch) => ch.name));
  }
}

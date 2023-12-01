import { slog } from "../../../../../slog";
import {
  ViewChannel,
  ViewChannelUpdate,
  ViewWorkspace,
  ViewWorkspaceUpdate,
} from "../../../../datatypes";
import { getView } from "../../../../view";

export class ChannelSidebar extends HTMLElement {
  private channelList: HTMLElement;

  private editChannelsButtonWrapper: HTMLElement;

  private channelNameToIdx = new Map<String, Number>();

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    let template = document.querySelector(
      "#channel-sidebar-component-template",
    );
    if (!(template instanceof HTMLTemplateElement)) {
      throw Error(
        "element with id #channel-sidebar-component-template was not found",
      );
    }
    if (this.shadowRoot === null) {
      throw Error(
        "could not find shadow DOM root for channeldisplay element in constructor",
      );
    }

    this.shadowRoot.append(template.content.cloneNode(true));

    let channelList = this.shadowRoot.querySelector("#channel-list");

    if (!(channelList instanceof HTMLElement)) {
      throw Error("Could not find an element with the channel-container id");
    }

    this.channelList = channelList;

    let edit_channels_button_wrapper_query = this.shadowRoot.querySelector(
      "#edit-channels-button-wrapper",
    );

    if (!(edit_channels_button_wrapper_query instanceof HTMLElement)) {
      throw Error(
        "Could not find an element with the edit-channels-button-wrapper id",
      );
    }

    this.editChannelsButtonWrapper = edit_channels_button_wrapper_query;

    // this.displayPosts.bind(this);
  }

  connectedCallback() {
    getView().addChannelListener(this);
    // We need this so that we can listen for when a workspace is closed.
    // Since if the workspace is closed, we shouldn't render the "Edit Channels" button.
    getView().addWorkspaceListener(this);
  }

  displayOpenChannel(channel: ViewChannel | null) {
    // TODO: may have to update this selector
    this.shadowRoot
      ?.querySelectorAll("#channel-list > li.selected-channel")
      .forEach((selectedEl) => {
        selectedEl.classList.remove("selected-channel");
      });

    // just don't do anything if the channel was de-selected.
    if (channel == null) {
      return;
    }

    let channelIdx = this.channelNameToIdx.get(channel.name);
    if (channelIdx === undefined) {
      // TODO: test to reproduce this error
      throw Error(
        "displayOpenChannel: trying to display a channel that doesn't exist on the view",
      );
    }
    let selectedChannelEl = this.shadowRoot?.querySelector(
      "#channel-select-" + channelIdx,
    );
    if (!(selectedChannelEl instanceof HTMLElement)) {
      throw Error(
        `displayOpenChannel: selected element with ID #channel-select-${channel.name} is not an HTML element`,
      );
    }
    selectedChannelEl.classList.add("selected-channel");
  }

  displayChannels(update: ViewChannelUpdate) {
    const channels = update.allChannels;
    slog.info("displayChannels", ["channels", `${JSON.stringify(channels)}`]);
    this.channelList.innerHTML = "";
    channels.forEach((channel, idx) => {
      let channelListEl = document.createElement("li");
      channelListEl.id = "channel-select-" + idx;
      this.channelNameToIdx.set(channel.name, idx);
      channelListEl.innerText = channel.name;
      this.channelList.append(channelListEl);
      channelListEl.addEventListener("click", () => {
        slog.info("clicked channel list el", [
          "channel.name",
          `${channel.name}`,
        ]);
        document.dispatchEvent(
          new CustomEvent("channelSelected", {
            detail: { name: channel.name },
          }),
        );
      });
    });
  }

  // If no workspace is selected, then don't render the "edit channels" button.
  displayOpenWorkspace(workspace: ViewWorkspace | null) {
    if (workspace == null) {
      this.editChannelsButtonWrapper.style.display = "none";
    } else {
      this.editChannelsButtonWrapper.style.display = "inherit";
    }
  }

  // We don't care about the actual workspaces.
  displayWorkspaces(update: ViewWorkspaceUpdate) {}
}

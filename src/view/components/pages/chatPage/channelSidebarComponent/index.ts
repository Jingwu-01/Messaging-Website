import { slog } from "../../../../../slog";
import {
  StateName,
  ViewChannel,
  ViewChannelUpdate,
  ViewWorkspace,
  ViewWorkspaceUpdate,
} from "../../../../datatypes";
import { getView } from "../../../../view";

/**
 * Channel side bar displays all the channels in the current workspace and allows users to select or edit a channel. 
 */
export class ChannelSidebar extends HTMLElement {
  /** Container for channels */
  private channelList: HTMLElement;

  /** Container for buttons */
  private buttonWrapper: HTMLElement;

  /** A map of channel name to ids */
  private channelNameToIdx = new Map<String, Number>(); 

  /** Refresh channel button */
  private refreshChannelsButton: HTMLElement;

  /**
   * Constructor for the channel side bar component. 
   */
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    let template = document.querySelector(
      "#channel-sidebar-component-template"
    );
    if (!(template instanceof HTMLTemplateElement)) {
      throw Error(
        "element with id #channel-sidebar-component-template was not found"
      );
    }
    if (this.shadowRoot === null) {
      throw Error(
        "could not find shadow DOM root for channeldisplay element in constructor"
      );
    }

    this.shadowRoot.append(template.content.cloneNode(true));

    let channelList = this.shadowRoot.querySelector("#channel-list");

    if (!(channelList instanceof HTMLElement)) {
      throw Error("Could not find an element with the channel-container id");
    }

    this.channelList = channelList;

    let button_wrapper_query = this.shadowRoot.querySelector("#button-wrapper");

    if (!(button_wrapper_query instanceof HTMLElement)) {
      throw Error("Could not find an element with the button-wrapper id");
    }

    this.buttonWrapper = button_wrapper_query;

    let refresh_channels_button_query = this.shadowRoot.querySelector(
      "#refresh-channels-button"
    );
    if (!(refresh_channels_button_query instanceof HTMLElement)) {
      throw Error(
        "Could not find an element with the refresh-channels-button id"
      );
    }
    this.refreshChannelsButton = refresh_channels_button_query;
    // this.displayPosts.bind(this);
  }

  /**
   * When connnected, add channel, workspace, and loading listeners in the view. Also, add click event listener to the refresh button. 
   */
  connectedCallback() {
    // Add listener for refresh channels button
    this.refreshChannelsButton.addEventListener("click", () => {
      let event_id = String(Date.now());
      this.refreshChannelsButton.setAttribute("loading-until-event", event_id);
      // Dispatch a refresh channel event 
      document.dispatchEvent(
        new CustomEvent("refreshChannels", {
          detail: {
            id: event_id,
          },
        })
      );
    });
    getView().addChannelListener(this);
    // We need this so that we can listen for when a workspace is closed.
    // Since if the workspace is closed, we shouldn't render the "Edit Channels" button.
    getView().addWorkspaceListener(this);
    // We need this to disable our channel buttons when channels are loading.
    getView().addLoadingListener(this);
  }

  /**
   * Display the open channel. 
   * @param channel a ViewChannel or null
   */
  displayOpenChannel(channel: ViewChannel | null) {
    // TODO: may have to update this selector
    this.shadowRoot
      ?.querySelectorAll("#channel-list > button.selected-channel")
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
        "displayOpenChannel: trying to display a channel that doesn't exist on the view"
      );
    }
    let selectedChannelEl = this.shadowRoot?.querySelector(
      "#channel-select-" + channelIdx
    );
    if (!(selectedChannelEl instanceof HTMLElement)) {
      throw Error(
        `displayOpenChannel: selected element with ID #channel-select-${channel.name} is not an HTML element`
      );
    }
    selectedChannelEl.classList.add("selected-channel");
  }

  /**
   * Display the channels of the current workspace. 
   * @param update ViewChannelUpdate
   */
  displayChannels(update: ViewChannelUpdate) {
    const channels = update.allChannels;
    slog.info("displayChannels", ["channels", `${JSON.stringify(channels)}`]);
    this.channelList.innerHTML = "";
    channels.forEach((channel, idx) => {
      let channelListEl = document.createElement("button");
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
          })
        );
      });
    });
  }

  /**
   * If no workspace is selected, then don't render the "edit channels" button.
   * @param workspace ViewWorkspace | null
   */
  displayOpenWorkspace(workspace: ViewWorkspace | null) {
    if (workspace == null) {
      this.buttonWrapper.style.display = "none";
    } else {
      this.buttonWrapper.style.display = "flex";
    }
  }

  /**
   * We don't care about the actual workspaces.
   * @param update ViewWorkspaceUpdate
   */
  displayWorkspaces(update: ViewWorkspaceUpdate) {}

  /**
   * Disable all of our buttons when our channels are loading.
   * @param state StateName
   */
  onLoading(state: StateName) {
    if (state == "channels") {
      this.channelList.querySelectorAll("button").forEach((button) => {
        button.disabled = true;
      });
    }
  }

  /**
   * Re-enable all of our buttons when our channels stop loading.
   * @param state StateName
   */
  onEndLoading(state: StateName) {
    if (state == "channels") {
      this.channelList.querySelectorAll("button").forEach((button) => {
        button.disabled = false;
      });
    }
  }
}

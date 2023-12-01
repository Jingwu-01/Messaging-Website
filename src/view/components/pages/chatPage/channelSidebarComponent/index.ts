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

  private buttonWrapper: HTMLElement;

  private channelEls = new Map<string, HTMLElement>();

  private refreshChannelsButton: HTMLElement;

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
      throw Error(
        "Could not find an element with the edit-channels-button-wrapper id"
      );
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
  }

  connectedCallback() {
    // Add listener for refresh channels button
    this.refreshChannelsButton.addEventListener("click", () => {
      let event_id = String(Date.now());
      this.refreshChannelsButton.setAttribute("loading-until-event", event_id);
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
  }

  displayOpenChannel(channel: ViewChannel | null) {
    // TODO: may have to update this selector
    this.channelList
      ?.querySelectorAll(".selected-channel")
      .forEach((selectedEl) => {
        selectedEl.classList.remove("selected-channel");
      });

    // just don't do anything if the channel was de-selected.
    if (channel == null) {
      return;
    }

    this.channelEls.get(channel.name)?.classList.add("selected-channel");
  }

  displayChannels(update: ViewChannelUpdate) {
    let channels = update.allChannels;
    slog.info("displayChannels", ["channels", `${JSON.stringify(channels)}`]);
    this.channelList.innerHTML = "";
    // Create a channel list element for each item.
    channels.forEach((channel, i) => {
      let channel_select_el = document.createElement("li");
      channel_select_el.innerHTML = `
      <loading-button-component id="channel-loading-button-${i}" style="border: none; background: none">
        <li slot="content">${channel.name}</li>
      </loading-button-component>
      `;

      let loading_button_el = channel_select_el.querySelector(
        `#channel-loading-button-${i}`
      );

      // Add a click listener to the loading button that selects the channel.
      loading_button_el?.addEventListener("click", () => {
        let event_id = String(Date.now());
        // Disable all of the other channel buttons
        this.channelList
          .querySelectorAll("loading-button-component")
          .forEach((other_loading_button) => {
            other_loading_button.setAttribute("disabled-until-event", event_id);
          });
        // Display loading spinner
        loading_button_el?.setAttribute("loading-until-event", event_id);
        document.dispatchEvent(
          new CustomEvent("channelSelected", {
            detail: {
              id: event_id,
              name: channel.name,
            },
          })
        );
      });
      this.channelEls.set(channel.name, channel_select_el);
      this.channelList.appendChild(channel_select_el);
    });
  }

  // If no workspace is selected, then don't render the "edit channels" button.
  displayOpenWorkspace(workspace: ViewWorkspace | null) {
    if (workspace == null) {
      this.buttonWrapper.style.display = "none";
    } else {
      this.buttonWrapper.style.display = "";
    }
  }

  // We don't care about the actual workspaces.
  displayWorkspaces(update: ViewWorkspaceUpdate) {}
}

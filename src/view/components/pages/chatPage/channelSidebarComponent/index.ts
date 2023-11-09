import { ViewChannel } from "../../../../datatypes";

export class ChannelSidebar extends HTMLElement {

    private channelList: HTMLElement;

    constructor() {
        super();

        this.attachShadow({mode: "open"});

        let template = document.querySelector("#channel-display-template");
        if (!(template instanceof HTMLTemplateElement)) {
            throw Error("channel display template was not found");
        }
        if (this.shadowRoot === null) {
            throw Error("could not find shadow DOM root for channeldisplay element in constructor");
        }
        
        this.shadowRoot.append(template.content.cloneNode(true));

        let channelList = this.shadowRoot.querySelector("#channel-list");

        if (!(channelList instanceof HTMLElement)) {
            throw Error("Could not find an element with the channel-container id");
        }

        this.channelList = channelList;

        // this.displayPosts.bind(this);

    }

    displayOpenChannel(channel: ViewChannel) {
        // TODO: may have to update this selector
        this.shadowRoot?.querySelectorAll("#channel-list > li.selected-channel").forEach((selectedEl) => {
            selectedEl.classList.remove("selected-channel");
        });
        let selectedChannelEl = this.shadowRoot?.querySelector("#channel-select-" + channel.name);
        if (!(selectedChannelEl instanceof HTMLElement)) {
            throw Error(`displayOpenChannel: selected element with ID #channel-select-${channel.name} is not an HTML element`);
        }
        selectedChannelEl.classList.add("selected-channel");
    }

    displayChannels(channels: Array<ViewChannel>) {
        this.channelList.innerHTML = "";
        for (let channel of channels) {
            let channelListEl = document.createElement("li");
            channelListEl.id = "channel-select-" + channel.name;
            channelListEl.innerText = channel.name;
            this.channelList.append(channelListEl);
            channelListEl.addEventListener("click", () => {
                document.dispatchEvent(
                    new CustomEvent("channelSelected", {
                        detail: {channel: channel.name}
                    })
                )
            });
        }
    }
}


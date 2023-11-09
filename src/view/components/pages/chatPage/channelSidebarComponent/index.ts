export class ChannelSidebar extends HTMLElement {

    private workSpaceHeader: HTMLElement;

    private channelContainer: HTMLElement;

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

        let workSpaceHeader = this.shadowRoot.querySelector("#work-name");
        let channelContainer = this.shadowRoot.querySelector("#channel-container");

        if (!(workSpaceHeader instanceof HTMLElement)) {
            throw Error("Could not find an element with the workspace-name id");
        }

        if (!(channelContainer instanceof HTMLElement)) {
            throw Error("Could not find an element with the channel-container id");
        }

        this.workSpaceHeader = workSpaceHeader;
        this.channelContainer = channelContainer;

        // this.displayPosts.bind(this);

    }
}


import { AppBar } from "../chatPage/appBarComponent";
import { ChannelSidebar } from "../chatPage/channelSidebarComponent";
import { PostDisplay } from "../chatPage/postDisplayComponent";

export class M3ssagin8App extends HTMLElement {

    private appBar: AppBar;

    private channelList: ChannelSidebar;

    private postDisplay: PostDisplay;

    constructor() {
        super();

        this.attachShadow({mode: "open"});

        let template = document.querySelector("m3ssagin8-app-template");

        // Note: this constructor code (when using a shadow root) code is
        // pretty duplicated; not sure how to reduce duplication because it's
        // kind of entangled
        if (!(template instanceof HTMLTemplateElement)) {
            throw Error("m3ssagin8app template was not found");
        }

        if (this.shadowRoot === null) {
            throw Error("could not find shadow DOM root for m3ssagin8app element in constructor");
        }

        this.shadowRoot.append(template.content.cloneNode(true));

        let appBar = this.shadowRoot.querySelector("app-bar");
        let channelList = this.shadowRoot.querySelector("channel-list");
        let postDisplay = this.shadowRoot.querySelector("post-display");

        if (!(appBar instanceof AppBar)) {
            throw Error("Could not find an app-bar element");
        }

        if (!(channelList instanceof ChannelSidebar)) {
            throw Error("Could not find a channel-list element");
        }

        if (!(postDisplay instanceof PostDisplay)) {
            throw Error("Could not find a post-display element");
        }

        this.appBar = appBar;
        this.channelList = channelList;
        this.postDisplay = postDisplay;
    }
}
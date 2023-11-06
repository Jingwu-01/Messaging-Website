import { ViewPost } from "../../../../datatypes";
import { Post } from "../postComponent";

export class PostDisplay extends HTMLElement {

    private channelHeader: HTMLElement;

    private postsContainer: HTMLElement;
    constructor() {
        super();

        this.attachShadow({mode: "open"});

        let template = document.querySelector("postdisplay-template");
        if (!(template instanceof HTMLTemplateElement)) {
            throw Error("post display template was not found");
        }
        if (this.shadowRoot === null) {
            throw Error("could not find shadow DOM root for postdisplay element in constructor");
        }
        
        this.shadowRoot.append(template.content.cloneNode(true));

        let channelHeader = this.shadowRoot.querySelector("#channel-name");
        let postsContainer = this.shadowRoot.querySelector("#posts-container");

        if (!(channelHeader instanceof HTMLElement)) {
            throw Error("Could not find an element with the channel-name id");
        }

        if (!(postsContainer instanceof HTMLElement)) {
            throw Error("Could not find an element with the posts-container id");
        }

        this.channelHeader = channelHeader;
        this.postsContainer = postsContainer;

        this.displayPosts.bind(this);
    }

    // TODO: add another helper for setting the channel name

    displayPosts(allPosts: Array<ViewPost>): void {
        // TODO: obv. just placeholder for testing
        for (let viewPost of allPosts) {
            let postEl = new Post();
            postEl.addPostContent(viewPost);
            this.postsContainer.append(postEl);
        }
    }


}
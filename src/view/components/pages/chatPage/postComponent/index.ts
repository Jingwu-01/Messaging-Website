import { ViewPost } from "../../../../datatypes";

class Post extends HTMLElement {

    private postHeader: HTMLElement;

    private postBody: HTMLElement;

    private postCreator: HTMLElement;

    private postTime: HTMLElement;

    constructor() {
        super();

        this.attachShadow({mode: "open"});

        let template = document.querySelector("post-template");
        if (!(template instanceof HTMLTemplateElement)) {
            throw Error("post template was not found");
        }
        if (this.shadowRoot === null) {
            throw Error("no shadow root exists");
        }
        this.shadowRoot.append(template.content.cloneNode(true));
        let postHeader = this.shadowRoot.querySelector(".post-header");
        let postBody = this.shadowRoot.querySelector(".post-body");
        let postCreator = this.shadowRoot.querySelector(".post-creator");
        let postTime = this.shadowRoot.querySelector(".post-time");
        
        if (!(postHeader instanceof HTMLElement)) {
            throw Error("Could not find an element with the post-header class");
        }
        if (!(postBody instanceof HTMLElement)) {
            throw Error("Could not find an element with the post-body class");
        }
        if (!(postCreator instanceof HTMLElement)) {
            throw Error("Could not find an element with the post-creator class");
        }
        if (!(postTime instanceof HTMLElement)) {
            throw Error("Could not find an element with the post-time class");
        }

        this.postHeader = postHeader;
        this.postBody = postBody;
        this.postCreator = postCreator;
        this.postTime = postTime;
    }

    addPostContent(viewPost: ViewPost): void {
        // TODO: obviously can add more functionality here later as needed.
        this.postBody.innerText = viewPost.Msg;
        this.postCreator.innerText = viewPost.CreatedUser;
        // assumed that time is in ms
        let postTimeObj = new Date(viewPost.PostTime)
        console.log(`addPostContent: postTimeObj: ${postTimeObj.toDateString()}`)
        this.postTime.innerText = postTimeObj.toDateString();
    }

    // TODO: add a private filter function on posts that can basically
    // handle filtering unstyled HTML with ** and stuff to strong and em
    // tags as needed
}
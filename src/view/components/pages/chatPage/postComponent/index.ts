import { ViewPost } from "../../../../datatypes";

export class PostComponent extends HTMLElement {
  private postHeader: HTMLElement;

  private postBody: HTMLElement;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    let template = document.querySelector("#post-template");
    if (!(template instanceof HTMLTemplateElement)) {
      throw Error("post template was not found");
    }
    if (this.shadowRoot === null) {
      throw Error("no shadow root exists");
    }
    this.shadowRoot.append(template.content.cloneNode(true));
    let postHeader = this.shadowRoot.querySelector("#post-header");
    let postBody = this.shadowRoot.querySelector("#post-body");

    if (!(postHeader instanceof HTMLElement)) {
      throw Error("Could not find an element with the post-header class");
    }
    if (!(postBody instanceof HTMLElement)) {
      throw Error("Could not find an element with the post-body class");
    }

    this.postHeader = postHeader;
    this.postBody = postBody;
  }

  // Sets the content of this post equal to viewPost
  addPostContent(viewPost: ViewPost): void {
    // TODO: obviously can add more functionality here later as needed.
    this.postBody.innerText = viewPost.Msg;
    this.postHeader.innerText = viewPost.CreatedUser;
    // assumed that time is in ms
    let postTimeObj = new Date(viewPost.PostTime);
    let postTime = document.createElement("time");
    console.log(`addPostContent: postTime: ${postTime}`);
    console.log(`addPostContent: postTimeObj: ${postTimeObj.toString()}`);
    postTime.innerText = postTimeObj.toString();
    this.postHeader.append(postTime);
  }

  // Adds childrenPosts as replies to this ViewPost.
  addPostChildren(childrenPosts: Array<ViewPost>): void {
    for (let childPost of childrenPosts) {
      let childPostEl = new PostComponent();
      childPostEl.addPostContent(childPost);
      this.shadowRoot
        ?.querySelector("#post-child-container")
        ?.appendChild(childPostEl);
      childPostEl.addPostChildren(childPost.Children);
    }
  }

  // TODO: add a private filter function on posts that can basically
  // handle filtering unstyled HTML with ** and stuff to strong and em
  // tags as needed
}

export default PostComponent;

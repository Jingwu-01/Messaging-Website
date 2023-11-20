import { ViewPost, ViewPostUpdate } from "../../../../datatypes";
import { getView } from "../../../../view";
import { PostComponent } from "../postComponent";
import { PostEditor } from "../postEditorComponent";

export class PostDisplay extends HTMLElement {
  private channelHeader: HTMLElement;

  private postsContainer: HTMLElement;

  private postEditor: PostEditor | undefined;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    let template = document.querySelector("#postdisplay-template");
    if (!(template instanceof HTMLTemplateElement)) {
      throw Error("post display template was not found");
    }
    if (this.shadowRoot === null) {
      throw Error(
        "could not find shadow DOM root for postdisplay element in constructor"
      );
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
    console.log(`constructor: this.channelHeader: ${this.channelHeader}`);
  }

  // is connected callback atomic?
  connectedCallback() {
    getView().addPostListener(this);
  }

  disconnectedCallback() {
    getView().removePostListener(this);
  }

  // TODO: add another helper for setting the channel name

  displayPosts(update: ViewPostUpdate): void {
    this.postsContainer.innerHTML = "";
    if (update.op == "modify") {
      // get the post that's affected
      // add the reaction
    }
    for (let viewPost of update.allPosts) {
      let postEl = new PostComponent();
      postEl.addPostContent(viewPost);
      this.postsContainer.append(postEl);
      postEl.addPostChildren(viewPost.children);
    }
  }

  displayPostEditor(): void {
    this.postEditor?.remove();
    this.postEditor = new PostEditor();
    this.shadowRoot?.append(this.postEditor);
  }

  removePostEditor(): void {
    this.postEditor?.remove();
  }

  replacePostEditor(newPostEditor: PostEditor) {
    this.postEditor?.remove();
    this.postEditor = newPostEditor;
  }

}

export default PostDisplay;

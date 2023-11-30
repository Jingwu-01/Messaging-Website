import { slog } from "../../../../../slog";
import { ViewPost, ViewPostUpdate } from "../../../../datatypes";
import { getView } from "../../../../view";
import { PostComponent } from "../postComponent";
import { PostEditor } from "../postEditorComponent";

export class PostDisplay extends HTMLElement {
  private channelHeader: HTMLElement;

  private postsContainer: HTMLElement;

  private postEditor: PostEditor;

  private postToHTMLChildren: Map<string, HTMLElement> = new Map<string, HTMLElement>();

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
    let postEditor = this.shadowRoot.querySelector("post-editor-component");

    if (!(channelHeader instanceof HTMLElement)) {
      throw Error("Could not find an element with the channel-name id");
    }

    if (!(postsContainer instanceof HTMLElement)) {
      throw Error("Could not find an element with the posts-container id");
    }

    if (!(postEditor instanceof PostEditor)) {
      throw Error("Could not find a post-editor-component element");
    }

    this.channelHeader = channelHeader;
    this.postsContainer = postsContainer;
    this.postEditor = postEditor;
    this.postEditor.setParentPath("");

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
    slog.info("postDisplay displayPosts: was called");
    if (update.op === "modify") {
      // get the post that's affected
      // add the reaction
    }
    if (update.op === "insert") {
      let postToInsert = update.affectedPosts[0];
      let postComp = new PostComponent();
      postComp.addPostContent(postToInsert);
      slog.info("displayPosts: insert", ["postToInsert.parent", postToInsert.parent], ["postToInsert", postToInsert], ["postComp", postComp]);
      let postChildren: NodeListOf<Element> | undefined;
      let parentEl: HTMLElement;
      if (postToInsert.postIdx === undefined) {
        slog.error("displayPosts", ["postToInsert.postIdx is undefined but should not be", `${postToInsert.postIdx}`]);
        throw new Error("postToInsert.postIdx is undefined but should not be");
      }
      slog.info("displayPosts", ["postToInsert.postIdx", postToInsert.postIdx]);
      if (postToInsert.parent === undefined || postToInsert.parent === "") {
        slog.info("displayPosts: postToInsert.parent is undefined");
        postChildren = this.postsContainer.querySelectorAll(":scope > post-component");
        parentEl = this.postsContainer;
      } else {
        let potentialParentEl = this.postToHTMLChildren.get(postToInsert.parent)
        if (potentialParentEl === undefined) {
          slog.error("displayPosts", ["postToInsert.parent", postToInsert.parent], ["potentialParentEl is undefined", potentialParentEl], ["this.postToHTMLChildren", this.postToHTMLChildren]);
          throw new Error("this.postToHTMLChildren.get(postToInsert.parent) is undefined");
        }
        parentEl = potentialParentEl;
        postChildren = parentEl.querySelectorAll(":scope > post-component");
      }
      slog.info("displayPosts", ["postChildren", postChildren], ["parentEl", parentEl], ["postComp", postComp], ["postToInsert.postIdx", postToInsert.postIdx], ["postChildren", postChildren], ["postChildren.length", postChildren.length]);
      if (postChildren.length === 0 || postToInsert.postIdx === postChildren.length) {
        slog.info("displayPosts: no children OR postToInsert.postIdx is at the end", ["postToInsert.postIdx", postToInsert.postIdx], ["postChildren.length", postChildren.length]);
        parentEl.append(postComp);
        slog.info("displayPosts, after appending to parentEl", ["parentEl", parentEl]);
      } else {
        let childNode = postChildren[postToInsert.postIdx];
        childNode.parentNode?.insertBefore(postComp, childNode);
      }
      let postPathArr = postToInsert.path.split("/");
      if (postPathArr.length !== 6) {
        throw Error("displayPosts: postPathArr is not of length 6");
      }
      let childrenContainer = document.createElement("section");
      childrenContainer.classList.add("post-children");
      this.postToHTMLChildren.set(postPathArr[5], childrenContainer);
      postComp.parentNode?.insertBefore(childrenContainer, postComp.nextSibling);
      slog.info("displayPosts", ["postComp.parentNode?", postComp.parentNode]);
    } else {
      this.postsContainer.innerHTML = "";
      for (let viewPost of update.allPosts) {
        let postEl = new PostComponent();
        postEl.addPostContent(viewPost);
        let postPathArr = viewPost.path.split("/");
        if (postPathArr.length !== 6) {
          throw Error("displayPosts: postPathArr is not of length 6");
        }
        let childrenContainer = document.createElement("section");
        childrenContainer.classList.add("post-children");
        this.postToHTMLChildren.set(postPathArr[5], childrenContainer);
        this.postsContainer.append(postEl);
        postEl.parentNode?.insertBefore(childrenContainer, postEl.nextSibling);
        this.displayPostsHelper(postEl, viewPost.children, childrenContainer);
      }
    }
  }

  displayPostsHelper(postEl: PostComponent, childrenPosts: Array<ViewPost>, childrenContainer: HTMLElement) {
    for (let childPost of childrenPosts) {
      let childPostEl = new PostComponent();
      childPostEl.addPostContent(childPost);
      childrenContainer.append(childPostEl);
      let childPostPathArr = childPost.path.split("/");
      if (childPostPathArr.length !== 6) {
        throw Error("displayPostsHelper: childPostPathArr is not of length 6");
      }
      let nextChildContainer = document.createElement("section");
      nextChildContainer.classList.add("post-children");
      this.postToHTMLChildren.set(childPostPathArr[5], nextChildContainer);
      childPostEl.parentNode?.insertBefore(nextChildContainer, childPostEl.nextSibling);
      this.displayPostsHelper(childPostEl, childPost.children, nextChildContainer);
    }
  }

  movePostEditorTo(postEl: PostComponent) {
    postEl.parentNode?.insertBefore(this.postEditor, postEl.nextSibling);
    let postPath = postEl.getPostPath();
    if (postPath === undefined) {
      throw Error("movePostEditorTo: postEl's parent path is undefined");
    }
    this.postEditor.setParentPath(postPath);
  }

}

export default PostDisplay;

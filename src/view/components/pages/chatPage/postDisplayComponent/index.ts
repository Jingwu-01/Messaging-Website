import { slog } from "../../../../../slog";
import { ViewPost, ViewPostUpdate } from "../../../../datatypes";
import { getView } from "../../../../view";
import { PostComponent } from "../postComponent";
import { PostEditor } from "../postEditorComponent";

export class PostDisplay extends HTMLElement {
  private channelHeader: HTMLElement;

  private postsContainer: HTMLElement;

  private postEditor: PostEditor;

  private postToHTMLChildren: Map<string, HTMLElement> = new Map<
    string,
    HTMLElement
  >();

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
    if (update.op === "modify" || update.op === "insert") {
      let opString = update.op;
      let postToUpsert = update.affectedPosts[0];
      let postComp: PostComponent;
      slog.info(
        "displayPosts: insert",
        ["postToUpsert.parent", postToUpsert.parent],
        ["postToUpsert", postToUpsert]
      );
      let postChildren: NodeListOf<Element> | undefined;
      let parentEl: HTMLElement;
      if (postToUpsert.postIdx === undefined) {
        slog.error("displayPosts", [
          "postToUpsert.postIdx is undefined but should not be",
          `${postToUpsert.postIdx}`,
        ]);
        throw new Error("postToUpsert.postIdx is undefined but should not be");
      }
      slog.info("displayPosts", ["postToUpsert.postIdx", postToUpsert.postIdx]);
      if (postToUpsert.parent === undefined || postToUpsert.parent === "") {
        slog.info("displayPosts: postToUpsert.parent is undefined");
        postChildren = this.postsContainer.querySelectorAll(
          ":scope > post-component"
        );
        parentEl = this.postsContainer;
      } else {
        let potentialParentEl = this.postToHTMLChildren.get(
          postToUpsert.parent
        );
        if (potentialParentEl === undefined) {
          slog.error(
            "displayPosts",
            ["postToUpsert.parent", postToUpsert.parent],
            ["potentialParentEl is undefined", potentialParentEl],
            ["this.postToHTMLChildren", this.postToHTMLChildren]
          );
          throw new Error(
            "this.postToHTMLChildren.get(postToUpsert.parent) is undefined"
          );
        }
        parentEl = potentialParentEl;
        postChildren = parentEl.querySelectorAll(":scope > post-component");
      }
      if (opString === "modify") {
        let potentialPostComp = postChildren[postToUpsert.postIdx];
        if (!(potentialPostComp instanceof PostComponent)) {
          throw new Error("potentialPostComp is not a post component");
        }
        postComp = potentialPostComp;
      } else {
        postComp = new PostComponent();
        postComp.addPostContent(postToUpsert);
      }
      slog.info(
        "displayPosts",
        ["postChildren", postChildren],
        ["parentEl", parentEl],
        ["postToUpsert.postIdx", postToUpsert.postIdx],
        ["postChildren", postChildren],
        ["postChildren.length", postChildren.length],
        ["postComp", postComp]
      );
      if (opString === "modify") {
        postComp.modifyPostContent(postToUpsert);
      } else {
        if (
          postChildren.length === 0 ||
          postToUpsert.postIdx === postChildren.length
        ) {
          slog.info(
            "displayPosts: no children OR postToUpsert.postIdx is at the end",
            ["postToUpsert.postIdx", postToUpsert.postIdx],
            ["postChildren.length", postChildren.length]
          );
          parentEl.append(postComp);
          slog.info("displayPosts, after appending to parentEl", [
            "parentEl",
            parentEl,
          ]);
        } else {
          let childNode = postChildren[postToUpsert.postIdx];
          childNode.parentNode?.insertBefore(postComp, childNode);
        }
        let postPathArr = postToUpsert.path.split("/");
        if (postPathArr.length !== 6) {
          throw Error("displayPosts: postPathArr is not of length 6");
        }
        let childrenContainer = document.createElement("section");
        childrenContainer.classList.add("post-children");
        this.postToHTMLChildren.set(postPathArr[5], childrenContainer);
        postComp.parentNode?.insertBefore(
          childrenContainer,
          postComp.nextSibling
        );
        slog.info("displayPosts", [
          "postComp.parentNode?",
          postComp.parentNode,
        ]);
      }
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

  displayPostsHelper(
    postEl: PostComponent,
    childrenPosts: Array<ViewPost>,
    childrenContainer: HTMLElement
  ) {
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
      childPostEl.parentNode?.insertBefore(
        nextChildContainer,
        childPostEl.nextSibling
      );
      this.displayPostsHelper(
        childPostEl,
        childPost.children,
        nextChildContainer
      );
    }
  }

  moveReplyPostEditorTo(postEl: PostComponent) {
    postEl.parentNode?.insertBefore(this.postEditor, postEl.nextSibling);
    let postPath = postEl.getPostPath();
    if (postPath === undefined) {
      throw Error("movePostEditorTo: postEl's parent path is undefined");
    }
    this.postEditor.setParentPath(postPath);
  }

  moveEditPostEditorTo(postEl: PostComponent) {
    this.moveReplyPostEditorTo(postEl);
    if (postEl.postMsg) {
      this.postEditor.setText(postEl.postMsg);
    }
  }
}

export default PostDisplay;

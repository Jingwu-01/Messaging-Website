import { slog } from "../../../../../slog";
import { ViewPost, ViewPostUpdate } from "../../../../datatypes";
import { getView } from "../../../../view";
import { PostComponent } from "../postComponent";
import { PostEditor } from "../postEditorComponent";

/**
 * Post Display component displays all the posts in the selected channel. 
 */
export class PostDisplay extends HTMLElement {
  /** post container element  */
  private postsContainer: HTMLElement;
  /** post editor class */
  private postEditor: PostEditor;
  /** A map of post ton its children posts */
  private postToHTMLChildren: Map<string, HTMLElement> = new Map<
    string,
    HTMLElement
  >();

  /**
   * Constructor for the post display. 
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Set up the template and clone. 
    let template = document.querySelector("#postdisplay-template");
    if (!(template instanceof HTMLTemplateElement)) {
      throw Error("post display template was not found");
    }
    if (this.shadowRoot === null) {
      throw Error(
        "could not find shadow DOM root for postdisplay element in constructor",
      );
    }
    this.shadowRoot.append(template.content.cloneNode(true));

    // Set up the other html elements
    let postsContainer = this.shadowRoot.querySelector("#posts-container");
    let postDisplayWrapper = this.shadowRoot.querySelector(
      "#postdisplay-wrapper",
    );

    if (!(postsContainer instanceof HTMLElement)) {
      throw Error("Could not find an element with the posts-container id");
    }
    if (!(postDisplayWrapper instanceof HTMLElement)) {
      throw Error("Could not find an element with the id postdisplay-wrapper");
    }

    let postEditor = new PostEditor();

    this.postsContainer = postsContainer;
    this.postsContainer.after(postEditor);

    this.postEditor = postEditor;
    this.postEditor.setParentPath("", null);
    this.postEditor.setTopReplyEl(postDisplayWrapper);

    this.displayPosts.bind(this);
  }


  /**
   * When connected, add post listener in the view. 
   */
  connectedCallback() {
    slog.info("PostDisplay: connectedCallback was called");
    getView().addPostListener(this);
  }

  /**
   * When disconnected, remove the post listener in the view. 
   */
  disconnectedCallback() {
    slog.info("PostDisplay: disconnectedCallback was called");
    getView().removePostListener(this);
  }

  /**
   * Display the posts based on the view update. 
   * @param update ViewPostUpdate
   */
  displayPosts(update: ViewPostUpdate): void {
    slog.info("postDisplay displayPosts: was called");
    if (update.op === "modify" || update.op === "insert") {
      let opString = update.op;
      let postToUpsert = update.affectedPosts[0];
      let postComp: PostComponent;
      slog.info(
        "displayPosts: insert or modify",
        ["postToUpsert.parent", postToUpsert.parent],
        ["postToUpsert", postToUpsert],
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
          ":scope > post-component",
        );
        parentEl = this.postsContainer;
      } else {
        let potentialParentEl = this.postToHTMLChildren.get(
          postToUpsert.parent,
        );
        if (potentialParentEl === undefined) {
          slog.error(
            "displayPosts",
            ["postToUpsert.parent", postToUpsert.parent],
            ["potentialParentEl is undefined", potentialParentEl],
            ["this.postToHTMLChildren", this.postToHTMLChildren],
          );
          throw new Error(
            "this.postToHTMLChildren.get(postToUpsert.parent) is undefined",
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
        ["postComp", postComp],
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
            ["postChildren.length", postChildren.length],
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
          postComp.nextSibling,
        );
        slog.info("displayPosts", [
          "postComp.parentNode?",
          postComp.parentNode,
        ]);
      }
    } else {
      // this.postsContainer.innerHTML = "";
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

  /**
   * Display posts helper function that display the children posts. 
   * @param postEl root post element 
   * @param childrenPosts array of children posts 
   * @param childrenContainer children container element 
   */
  displayPostsHelper(
    postEl: PostComponent,
    childrenPosts: Array<ViewPost>,
    childrenContainer: HTMLElement,
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
        childPostEl.nextSibling,
      );
      this.displayPostsHelper(
        childPostEl,
        childPost.children,
        nextChildContainer,
      );
    }
  }

  /**
   * Move the post editor to the correct position. 
   * @param postEl postComponent being replied to 
   */
  moveReplyPostEditorTo(postEl: PostComponent) {
    postEl.parentNode?.insertBefore(this.postEditor, postEl.nextSibling);
    let postPath = postEl.getPostPath();
    if (postPath === undefined) {
      throw Error("movePostEditorTo: postEl's parent path is undefined");
    }
    this.postEditor.setParentPath(postPath, postEl);
  }

}

export default PostDisplay;

import { slog } from "../../../../../slog";
import { ReactionData, StarExtension, ViewPost } from "../../../../datatypes";
import { getView } from "../../../../view";
import ReactionComponent from "../../../pieces/reactionComponent";
import ReplyButtonComponent from "../../../pieces/replyButtonComponent";
import StarButtonComponent from "../../../pieces/starButtonComponent";
import { PostEditor } from "../postEditorComponent";

export class PostComponent extends HTMLElement {
  private postHeader: HTMLElement;

  private postBody: HTMLElement;

  private postPath: string | undefined;

  private postButtons: HTMLElement;

  private postUser: string | undefined;

  private replyButton: ReplyButtonComponent;

  private reactionButtons: Map<string, ReactionComponent> = new Map<
    string,
    ReactionComponent
  >();

  private controller: AbortController | null = null;

  private postMsg: string | undefined;

  private starButton: StarButtonComponent;

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
    let postButtons = this.shadowRoot.querySelector("#post-buttons");

    if (!(postHeader instanceof HTMLElement)) {
      throw new Error("Could not find an element with the #post-header id");
    }
    if (!(postBody instanceof HTMLElement)) {
      throw new Error("Could not find an element with the #post-body id");
    }
    if (!(postButtons instanceof HTMLElement)) {
      throw new Error("Could not find an element with the #post-buttons id");
    }

    this.postHeader = postHeader;
    this.postBody = postBody;
    this.postButtons = postButtons;

    let starButton = new StarButtonComponent();
    this.postHeader.append(starButton);
    this.starButton = starButton;

    // add buttons
    let reactions = {
      smile: "lucide:smile",
      frown: "lucide:frown",
      like: "mdi:like-outline",
      celebrate: "mingcute:celebrate-line",
    };
    let replyButton = new ReplyButtonComponent();
    this.postButtons.append(replyButton);
    this.replyButton = replyButton;

    for (const [reactionName, reactionIcon] of Object.entries(reactions)) {
      let reactionComp = new ReactionComponent();
      this.postButtons.append(reactionComp);
      reactionComp.setAttribute("icon", reactionIcon);
      reactionComp.setAttribute("reacted", "false");
      reactionComp.id = `${reactionName}-reaction`;
      this.reactionButtons.set(reactionName, reactionComp);
    }
  }

  connectedCallback() {
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };

    // Add click event listener for reply button
    this.replyButton.addEventListener(
      "click",
      this.addReplyPostEditor.bind(this),
      options,
    );
  }

  static get observedAttributes(): string[] {
    return ["starred"];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "starred") {
      if (newValue === "true") {
        this.replyButton.style.display = 'none';
      }
    }
  }

  disconnectedCallback() {
    this.controller?.abort();
    this.controller = null;
  }

  addReplyPostEditor(event: MouseEvent) {
    // let postEditor = new PostEditor();
    // // this call should technically be before the previous one
    // getView().replacePostEditor(postEditor);
    // this.postBody.parentNode?.insertBefore(postEditor, this.postBody.nextSibling);
    const postAll = this.shadowRoot?.querySelector("#post-all");
    if (!(postAll instanceof HTMLElement)){
      throw Error("cannot find #post-all HTMLElement")
    } 
    postAll.style.backgroundColor = "#d9d9d9"; 
    postAll.style.borderRadius = "5px"; 
    getView().moveReplyPostEditorTo(this);
  }

  // Sets the content of this post equal to viewPost
  addPostContent(viewPost: ViewPost): void {
    // TODO: obviously can add more functionality here later as needed.
    slog.info("addPostContent: top of func call", ["viewPost", viewPost]);
    this.postPath = viewPost.path;
    console.log("Posting the msg: " + viewPost.msg);
    // this.postBody.innerText = this.formatText(viewPost.msg)
    this.appendFormattedText(viewPost.msg, this.postBody);
    this.postMsg = viewPost.msg;
    let postUserText = this.postHeader.querySelector("#post-user-text");
    // TODO handle error better
    if (postUserText != null) {
      postUserText.innerHTML = viewPost.createdUser;
    }
    this.postUser = viewPost.createdUser;
    // assumed that time is in ms
    let postTimeObj = new Date(viewPost.postTime);
    let postTimeShortEl = this.postHeader.querySelector("#post-time-short");
    // TODO handle error better
    if (postTimeShortEl != null) {
      // display date if not today, time if today
      let timeToDisplay = `${postTimeObj.getDate()}`;
      if (postTimeObj.getDate() == new Date().getDate()) {
        timeToDisplay = postTimeObj.toLocaleTimeString();
      }
      postTimeShortEl.setAttribute("datetime", postTimeObj.toISOString());
      postTimeShortEl.innerHTML = `<u>${timeToDisplay}</u>`;
    }
    // TODO handle error better
    let postTimeLongEl = this.postHeader.querySelector("#post-time-long");
    if (postTimeLongEl != null) {
      postTimeLongEl.setAttribute("datetime", postTimeObj.toISOString());
      postTimeLongEl.innerHTML = postTimeObj.toString();
    }

    let currentUsername: string;
    let currentUser = getView().getUser();
    if (currentUser === null) {
      // this is the case where we're logged out but dealing with this event.
      slog.info(
        "addPostContent: trying to add a post when a user is logged out, dead request",
      );
      return;
    }
    currentUsername = currentUser.username;

    for (let [reactionName, reactionButton] of this.reactionButtons) {
      let reactionCount = viewPost.reactions[reactionName].length;
      slog.info(
        "addPostContent: reaction loop",
        ["reactionName", reactionName],
        ["reactionCount", reactionCount],
      );
      reactionButton.setAttribute("reaction-count", reactionCount.toString());
      if (viewPost.reactions[reactionName].includes(currentUsername)) {
        reactionButton.setAttribute("reacted", "true");
      } else {
        reactionButton.setAttribute("reacted", "false");
      }
      reactionButton.setParentPath(viewPost.path);
      reactionButton.setLoggedInUser(currentUsername);
    }

    // TODO: check if the post is starred
    // TODO: set the attribute 'starred' of the star button based on whether or not the post is starred.
    // TODO:
    slog.info("addPostContent: initializing starred post");
    let extensionsObj = viewPost.extensions;
    if (extensionsObj["p2group50"].includes(currentUsername)) {
      this.starButton.setAttribute("reacted", "true");
    } else {
      this.starButton.setAttribute("reacted", "false");
    }

    this.starButton.setLoggedInUser(currentUsername);
    this.starButton.setParentPath(viewPost.path);
  }

  // Adds childrenPosts as replies to this ViewPost.
  addPostChildren(childrenPosts: Array<ViewPost>): void {
    for (let childPost of childrenPosts) {
      let childPostEl = new PostComponent();
      childPostEl.addPostContent(childPost);
      this.shadowRoot
        ?.querySelector("#post-child-container")
        ?.appendChild(childPostEl);
      childPostEl.addPostChildren(childPost.children);
    }
  }

  appendPostEditor(postEditor: PostEditor) {
    this.append(postEditor);
  }

  getPostPath() {
    return this.postPath;
  }

  // displayPosts(update: ViewPostUpdate) {
  //   // if this post's id is in update.affectedPosts,
  //   // then add the reactio if it's a "modify"
  // }

  /* Convert the input string to their corresponding HTML elements based on the markdown patterns and append them to the input HTML container element. Mark down patterns: 
  1. Text surrounded by single * symbols rendered in italics using <em>; 
  2. Text surrounded by double * symbols rendered in bold using <strong>;
  3. Text and a URL surrounded by []() rendered as links using <a>;
  4. Reaction names like :smile: must be rendered as their associated emoji using <iconify>. 
  5. Other text rendered as plain text using <p> */
  appendFormattedText(text: string, container: HTMLElement): void {
    // Regular expressions for different markdown patterns
    const patterns = {
      bold: /\*\*(.*?)\*\*/g,
      italic: /\*(.*?)\*/g,
      link: /\[(.*?)\]\((.*?)\)/g,
    };

    // Replace the markdown with corresponding HTML elements
    text = text
      .replace(patterns.bold, (_, b) => `<strong>${b}</strong>`)
      .replace(patterns.italic, (_, i) => `<em>${i}</em>`)
      .replace(patterns.link, (_, text, url) => `<a href="${url}">${text}</a>`)
      .replace(/:smile:/g, `<iconify-icon icon="lucide:smile"></iconify-icon>`)
      .replace(/:frown:/g, `<iconify-icon icon="lucide:frown"></iconify-icon>`)
      .replace(
        /:like:/g,
        `<iconify-icon icon="mdi:like-outline"></iconify-icon>`,
      )
      .replace(
        /:celebrate:/g,
        `<iconify-icon icon="mingcute:celebrate-line"></iconify-icon>`,
      )
      .replace(/\n/g, "<br>");

    // Split the text into paragraphs
    text.split(/\n\n/).forEach((paragraphText) => {
      const paragraph = document.createElement("p");
      paragraph.innerHTML = paragraphText;
      container.appendChild(paragraph);
    });
  }

  modifyPostContent(viewPost: ViewPost) {
    let reactionData = viewPost.reactions;
    this.updateReactions(reactionData);
    let extensionData = viewPost.extensions;
    this.updateExtensions(extensionData);
  }

  updateReactions(reactionData: ReactionData) {
    let currentUsername: string;
    let currentUser = getView().getUser();
    if (currentUser === null) {
      // this is the case where we're logged out but dealing with this event.
      slog.info(
        "addPostContent: trying to add a post when a user is logged out, dead request",
      );
      return;
    }
    currentUsername = currentUser.username;

    for (const [reactionName, reactionArray] of Object.entries(reactionData)) {
      let reactionButton = this.reactionButtons.get(reactionName);
      if (reactionButton !== undefined) {
        let reactionCount = reactionArray.length;
        slog.info(
          "addPostContent: reaction loop",
          ["reactionName", reactionName],
          ["reactionCount", reactionCount],
        );
        reactionButton.setAttribute("reaction-count", reactionCount.toString());
        if (reactionArray.includes(currentUsername)) {
          reactionButton.setAttribute("reacted", "true");
        } else {
          reactionButton.setAttribute("reacted", "false");
        }
      }
    }
  }

  updateExtensions(extensionData: StarExtension) {
    let currentUsername: string;
    let currentUser = getView().getUser();
    if (currentUser === null) {
      // this is the case where we're logged out but dealing with this event.
      slog.info(
        "addPostContent: trying to add a post when a user is logged out, dead request",
      );
      return;
    }
    currentUsername = currentUser.username;

    let starButton = this.starButton;
    if (extensionData["p2group50"].includes(currentUsername)) {
      starButton.setAttribute("reacted", "true");
    } else {
      starButton.setAttribute("reacted", "false");
    }
  }

  getPostText() {
    return this.postMsg;
  }

  unhighlight() {
    // TODO: unhighlight the post
  }
}

export default PostComponent;

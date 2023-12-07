import { slog } from "../../../../../slog";
import { ReactionData, StarExtension, ViewPost } from "../../../../datatypes";
import { getView } from "../../../../view";
import ReactionComponent from "../../../pieces/reactionComponent";
import ReplyButtonComponent from "../../../pieces/replyButtonComponent";
import StarButtonComponent from "../../../pieces/starButtonComponent";
import { PostEditor } from "../postEditorComponent";

/**
 * PostComponent displays the content of an individual post. 
 */
export class PostComponent extends HTMLElement {
  /** Container of everthing of the post */
  private postAll: HTMLElement; 

  /** Container of post header */
  private postHeader: HTMLElement;

  /** Container of post body */
  private postBody: HTMLElement;

  /** path of the post  */
  private postPath: string | undefined;

  /** Container of post buttons */
  private postButtons: HTMLElement;

  /** Post user */
  private postUser: string | undefined;

  /** Reply button of the post */
  private replyButton: ReplyButtonComponent;

  /** Reaction buttons of the post */
  private reactionButtons: Map<string, ReactionComponent> = new Map<
    string,
    ReactionComponent
  >();

  /** Controller */
  private controller: AbortController | null = null;

  /** Post message */
  private postMsg: string | undefined;

  /** Star button of the post */
  private starButton: StarButtonComponent;

  /**
   * Constructor for the post component. 
   */
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
    let postAll = this.shadowRoot?.querySelector("#post-all");

    if (!(postHeader instanceof HTMLElement)) {
      throw new Error("Could not find an element with the #post-header id");
    }
    if (!(postBody instanceof HTMLElement)) {
      throw new Error("Could not find an element with the #post-body id");
    }
    if (!(postButtons instanceof HTMLElement)) {
      throw new Error("Could not find an element with the #post-buttons id");
    }
    if (!(postAll instanceof HTMLElement)){
      throw new Error("cannot find #post-all HTMLElement")
    } 

    this.postHeader = postHeader;
    this.postBody = postBody;
    this.postButtons = postButtons;
    this.postAll = postAll

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

  /** 
   * When connected, add listener to add reply 
   */
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

  /**
   * observe the starred attribute. 
   */
  static get observedAttributes(): string[] {
    return ["starred"];
  }

  /**
   * Hide the reply button in the starred posts
   * @param name string of changed attributes
   * @param oldValue old value of changed attributes
   * @param newValue new value of changed attributes
   */
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "starred") {
      if (newValue === "true") {
        this.replyButton.style.display = 'none';
      }
    }
  }

  /** When disconencted, abort the controller.  */
  disconnectedCallback() {
    this.controller?.abort();
    this.controller = null;
  }

  /**
   * Move the post editor under the correct post when reply is clicked. 
   * @param event MouseEvent
   */
  addReplyPostEditor(event: MouseEvent) {
    // let postEditor = new PostEditor();
    // // this call should technically be before the previous one
    // getView().replacePostEditor(postEditor);
    // this.postBody.parentNode?.insertBefore(postEditor, this.postBody.nextSibling);
    this.highlight();
    getView().moveReplyPostEditorTo(this);
  }

  /**
   * Sets the content of this post equal to viewPost
   * @param viewPost ViewPost
   * @returns void
   */
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

  /**
   * Adds childrenPosts as replies to this ViewPost.
   * @param childrenPosts an array of ViewPost
   */
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

  /**
   * append the post editor to the bottom of the page. 
   * @param postEditor PostEditor
   */
  appendPostEditor(postEditor: PostEditor) {
    this.append(postEditor);
  }

  /**
   * get the post path
   * @returns the post path string
   */
  getPostPath(): string | undefined {
    return this.postPath;
  }

  // displayPosts(update: ViewPostUpdate) {
  //   // if this post's id is in update.affectedPosts,
  //   // then add the reactio if it's a "modify"
  // }

  /**
   * Convert the input string to their corresponding HTML elements based on the markdown patterns and append them to the input HTML container element. Mark down patterns: 
  1. Text surrounded by single * symbols rendered in italics using <em>; 
  2. Text surrounded by double * symbols rendered in bold using <strong>;
  3. Text and a URL surrounded by []() rendered as links using <a>;
  4. Reaction names like :smile: must be rendered as their associated emoji using <iconify>. 
  5. Other text rendered as plain text using <p>
   * @param text string for conversion 
   * @param container HTML that accepts the converted text
   */
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

  /**
   * Modify the post content based on input ViewPost
   * @param viewPost ViewPost
   */
  modifyPostContent(viewPost: ViewPost) {
    let reactionData = viewPost.reactions;
    this.updateReactions(reactionData);
    let extensionData = viewPost.extensions;
    this.updateExtensions(extensionData);
  }

  /**
   * Update the reactions based on received ReactionData
   * @param reactionData ReactionData
   * @returns nothing 
   */
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

  /**
   * update the extensions based on received StarExtension
   * @param extensionData StarExtension
   * @returns nothing 
   */
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

  /**
   * get post text of the post. 
   * @returns string for the post message 
   */
  getPostText() {
    return this.postMsg;
  }

  /**
   * highlight a post that the user is replying to 
   */
  highlight() {
    this.postAll.style.backgroundColor = "#d9d9d9"; 
    this.postAll.style.borderRadius = "5px"; 
  }

  /**
   * unhighly a post that the user is no longer replying to 
   */
  unhighlight() {
    this.postAll.style.backgroundColor = "transparent"; 
    this.postAll.style.borderRadius = "0px"; 
  }
}

export default PostComponent;

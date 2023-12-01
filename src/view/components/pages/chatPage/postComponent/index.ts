import { slog } from "../../../../../slog";
import { ViewPost } from "../../../../datatypes";
import { getView } from "../../../../view";
import { PostEditor } from "../postEditorComponent";

export class PostComponent extends HTMLElement {
  private postHeader: HTMLElement;

  private postBody: HTMLElement;

  private postPath: string | undefined;

  private controller: AbortController | null = null;

  private postMsg: string | undefined;

  private postUser: string | undefined;

  private smileReaction: HTMLElement;

  private frownReaction: HTMLElement;

  private likeReaction: HTMLElement;

  private celebrateReaction: HTMLElement;

  private replyButton: HTMLElement;

  private editPostButton : HTMLElement; 

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
    let smileReaction = this.shadowRoot.querySelector("#smile-reaction");
    let likeReaction = this.shadowRoot.querySelector("#like-reaction");
    let frownReaction = this.shadowRoot.querySelector("#frown-reaction");
    let celebrateReaction = this.shadowRoot.querySelector(
      "#celebrate-reaction",
    );
    let replyButton = this.shadowRoot.querySelector("reply-button-component");
    let editPostButton = this.shadowRoot.querySelector("edit-post-button-component")

    if (!(postHeader instanceof HTMLElement)) {
      throw Error("Could not find an element with the post-header class");
    }
    if (!(postBody instanceof HTMLElement)) {
      throw Error("Could not find an element with the post-body class");
    }

    if (!(smileReaction instanceof HTMLElement)) {
      throw Error("Could not find an element with id #smile-reaction");
    }

    if (!(likeReaction instanceof HTMLElement)) {
      throw Error("Could not find an element with id #like-reaction");
    }

    if (!(frownReaction instanceof HTMLElement)) {
      throw Error("Could not find an element with id #frown-reaction");
    }

    if (!(celebrateReaction instanceof HTMLElement)) {
      throw Error("Could not find an element with id #smile-reaction");
    }

    if (!(replyButton instanceof HTMLElement)) {
      throw Error("Could not find a reply-button-component element");
    }

    if (!(editPostButton instanceof HTMLElement)) {
      throw Error("Could not find a edit-post-button-component element")
    }

    this.postHeader = postHeader;
    this.postBody = postBody;
    this.smileReaction = smileReaction;
    this.likeReaction = likeReaction;
    this.frownReaction = frownReaction;
    this.celebrateReaction = celebrateReaction;
    this.replyButton = replyButton;
    this.editPostButton = editPostButton
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

    // Add click event listener for edit post button
     this.editPostButton.addEventListener(
      "click",
      this.addEditPostEditor.bind(this),
      options,
    );
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
    getView().moveReplyPostEditorTo(this);
  }

  addEditPostEditor(event: MouseEvent) {
    getView().moveEditPostEditorTo(this);
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

    let smileCount, frownCount, likeCount, celebrateCount: number;

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

    smileCount = viewPost.reactions.smile.length;
    if (viewPost.reactions.smile.includes(currentUsername)) {
      this.smileReaction.classList.add("reacted");
    }

    frownCount = viewPost.reactions.frown.length;
    if (viewPost.reactions.frown.includes(currentUsername)) {
      this.frownReaction.classList.add("reacted");
    }

    likeCount = viewPost.reactions.like.length;
    if (viewPost.reactions.like.includes(currentUsername)) {
      this.likeReaction.classList.add("reacted");
    }

    celebrateCount = viewPost.reactions.celebrate.length;
    if (viewPost.reactions.celebrate.includes(currentUsername)) {
      this.celebrateReaction.classList.add("reacted");
    }

    slog.info(
      "addPostContent",
      ["smileCount", smileCount],
      ["frownCount", frownCount],
      ["likeCount", likeCount],
      ["celebrateCount", celebrateCount],
    );

    // const smileReaction = this.shadowRoot?.querySelector("reaction-component");
    // slog.info("addPostContent", ["smileReaction", smileReaction?.cloneNode(true)], ["typeof smileReaction", typeof smileReaction], ["smileReaction instanceof ReactionComponent", smileReaction instanceof ReactionComponent]);
    this.smileReaction.setAttribute("reaction-count", smileCount.toString());

    this.frownReaction.setAttribute("reaction-count", frownCount.toString());

    this.likeReaction.setAttribute("reaction-count", likeCount.toString());

    this.celebrateReaction.setAttribute(
      "reaction-count",
      celebrateCount.toString(),
    );
    
    let loggedinUser = getView().getUser()?.username
    if (!(loggedinUser === this.postUser)){
      this.editPostButton.setAttribute("data-visible", "false")
    }

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
    if (viewPost.msg !== this.postMsg) {
      this.appendFormattedText(viewPost.msg, this.postBody);
    }
  }

  getPostText(){
    return this.postMsg
  }
}

export default PostComponent;

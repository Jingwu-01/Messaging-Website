import { slog } from "../../../../../slog";
import { ViewPost } from "../../../../datatypes";
import { getView } from "../../../../view";
import ReactionComponent from "../../../pieces/reactionComponent";
import { PostEditor } from "../postEditorComponent";

export class PostComponent extends HTMLElement {
  private postHeader: HTMLElement;

  private postBody: HTMLElement;

  private postPath: string | undefined;

  private controller: AbortController | null = null;

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

  connectedCallback() {
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    const replyButton = this.shadowRoot?.querySelector(
      "reply-button-component"
    );
    if (!(replyButton instanceof HTMLElement)) {
      throw new Error("reply-button-component is not an HTMLElement");
    }
    replyButton.addEventListener(
      "click",
      this.addPostEditor.bind(this),
      options
    );
  }

  disconnectedCallback() {
    this.controller?.abort();
    this.controller = null;
  }

  addPostEditor(event: MouseEvent) {
    // let postEditor = new PostEditor();
    // // this call should technically be before the previous one
    // getView().replacePostEditor(postEditor);
    // this.postBody.parentNode?.insertBefore(postEditor, this.postBody.nextSibling);
    getView().movePostEditorTo(this);
  }

  // Sets the content of this post equal to viewPost
  addPostContent(viewPost: ViewPost): void {
    // TODO: obviously can add more functionality here later as needed.
    this.postPath = viewPost.path;
    let rawMsg = viewPost.msg
    let newText = this.replaceReactionText(rawMsg)
    this.postBody.innerText = newText;
    let postUserText = this.postHeader.querySelector("#post-user-text");
    // TODO handle error better
    if (postUserText != null) {
      postUserText.innerHTML = viewPost.createdUser;
    }
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

    // let smileCount, frownCount, likeCount, celebrateCount: number

    // if (!(viewPost.reactions.smile) == undefined) {
    //   smileCount = viewPost.reactions.smile.length 
    // } else {
    //   smileCount = 0; 
    // }
    
    // if (viewPost.reactions.frown) {
    //   frownCount = viewPost.reactions.frown.length 
    // } else {
    //   frownCount = 0; 
    // }

    // if (viewPost.reactions.like) {
    //   likeCount = viewPost.reactions.like.length 
    // } else {
    //   likeCount = 0; 
    // }

    // if (viewPost.reactions.celebrate) {
    //   celebrateCount = viewPost.reactions.celebrate.length 
    // } else {
    //   celebrateCount = 0; 
    // }

    // const smileReaction = this.shadowRoot?.querySelector("reaction-component") 
    // console.log(smileReaction)
    // console.log(smileReaction instanceof HTMLElement);
    // if (!(smileReaction instanceof ReactionComponent)){
    //   throw new Error ("smileReaction is not a ReactionComponent")
    // }
    // smileReaction.addReactionCount(smileCount)

    // const frownReaction = this.shadowRoot?.querySelector("#frown-reaction")
    // if (!(frownReaction instanceof ReactionComponent)){
    //   throw new Error ("frownReaction is not a ReactionComponent")
    // }
    // frownReaction.addReactionCount(frownCount)

    // const likeReaction = this.shadowRoot?.querySelector("#like-reaction")
    // if (!(likeReaction instanceof ReactionComponent)){
    //   throw new Error ("likeReaction is not a ReactionComponent")
    // }
    // likeReaction.addReactionCount(likeCount)

    // const celebrateReaction = this.shadowRoot?.querySelector("#celebrate-reaction")
    // if (!(celebrateReaction instanceof ReactionComponent)){
    //   throw new Error ("celebrateReaction is not a ReactionComponent")
    // }
    // celebrateReaction.addReactionCount(celebrateCount)
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

  // TODO: add a private filter function on posts that can basically
  // handle filtering unstyled HTML with ** and stuff to strong and em
  // tags as needed

  replaceReactionText(text: string): string {
    const replacements: {[key: string]: string} = {
      ':smile:': '<iconify-icon icon="lucide:smile" class="reaction-icon"></iconify-icon>', 
      ':frown:': '<iconify-icon icon="lucide:frown" class="reaction-icon"></iconify-icon>', 
      ':like:': '<iconify-icon icon="mdi:like-outline" class="reaction-icon"></iconify-icon>', 
      ':celebrate:': '<iconify-icon icon="mingcute:celebrate-line" class="reaction-icon"></iconify-icon>'
    };

    return text.replace(/:smile:|:frown:|:like:|:celebrate:/g, (match) => replacements[match]);
}
  
}

export default PostComponent;

import { slog } from "../../../../../slog";
import { StateName } from "../../../../datatypes";
import { getView } from "../../../../view";
import PostComponent from "../postComponent";

type StringFunction = () => string;

/**
 * PostEditor component is a post editor that allows users to add a post.
 */
export class PostEditor extends HTMLElement {
  // TODO: can definitely add abortcontroller for event handlers and
  // 'deregistering' the event handlers here.

  /** Controller */
  private controller: AbortController | null = null;

  /** Container for post operations */
  private postOperations: HTMLElement;

  /** Text area element */
  // TODO: can we make this more generic?
  private postInput: HTMLTextAreaElement;

  /** post form element */
  private postForm: HTMLFormElement;

  /** parent path of the post editor */
  private parentPath: string | undefined;

  /** cancel reply button element */
  private cancelReply: HTMLElement;

  /** top reply element */
  private topReplyEl: HTMLElement | undefined;
  
  /** sumbit icon */
  private submitPostIcon: HTMLElement;

  /** sumbit post button */
  private submitPostButton: HTMLElement;

  /** parent post component of the post editor.  */
  private parentPost: PostComponent | null = null;

  /**
   * Constructor for the post editor component.
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Set up the template and clone. 
    let template = document.querySelector("#post-editor-template");
    if (!(template instanceof HTMLTemplateElement)) {
      throw Error("post editor template was not found");
    }
    if (this.shadowRoot === null) {
      throw Error(
        "could not find shadow DOM root for post-editor element in constructor"
      );
    }
    this.shadowRoot.append(template.content.cloneNode(true));

    // Set up the other elements and check if they actually exist. 
    let postOperations = this.shadowRoot.querySelector("#post-operations");
    let postInput = this.shadowRoot.querySelector("#post-input");
    let postForm = this.shadowRoot.querySelector("#post-form");
    let cancelReply = this.shadowRoot.querySelector("#cancel-reply");
    let submitPostIcon = this.shadowRoot.querySelector("#send-icon");
    let submitPostButton = this.shadowRoot.querySelector("#post-submit");

    if (!(postOperations instanceof HTMLElement)) {
      throw Error("Could not find an element with the post-operations id");
    }
    if (!(postInput instanceof HTMLTextAreaElement)) {
      throw Error("Could not find a text area element with the post-input id");
    }

    if (!(postForm instanceof HTMLFormElement)) {
      throw Error("Could not find an element with the post-form id");
    }

    if (!(cancelReply instanceof HTMLElement)) {
      throw Error("Could not find an elemnet with the cancel-reply id");
    }

    if (!(submitPostIcon instanceof HTMLElement)) {
      throw Error("Could not find an element with the send-icon id");
    }

    if (!(submitPostButton instanceof HTMLElement)) {
      throw Error("Could not find an element with the post-submit id");
    }

    // assignment to this 
    this.postOperations = postOperations;
    this.postInput = postInput;
    this.postForm = postForm;
    this.cancelReply = cancelReply;
    this.submitPostButton = submitPostButton;
    this.submitPostIcon = submitPostIcon;
  }

  /**
   * When the component is connected, set the operations correctly and event lisners.
   */
  connectedCallback() {
    // post editor operation callbacks
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };

    slog.info("postEditor added to the DOM");
    // set up the post editor 
    let postOperationElements = this.postOperations.children;
    for (let childEl of postOperationElements) {
      let id = childEl.id;
      let splitId = id.split("-");
      let operationType = splitId[1];
      let innerTextFunc: StringFunction;
      let prefixFunc: StringFunction;
      let suffixFunc: StringFunction;
      switch (operationType) {
        // Different operation types. 
        case "reaction": {
          innerTextFunc = () => {
            return splitId[0];
          };
          break;
        }
        case "text": {
          innerTextFunc = () => {
            let startCharIdx = this.postInput.selectionStart;
            let endCharIdx = this.postInput.selectionEnd;
            return this.postInput.value.substring(startCharIdx, endCharIdx);
          };
          break;
        }
        default: {
          throw Error(
            `post editor connected callback: expected id of post operation to be of the form <operation>-text or <operation>-reaction, but id is: ${id}`
          );
        }
      }
      switch (splitId[0]) {
        // Markdowns for different operations
        case "bold":
          prefixFunc = this.boldMarkdown;
          suffixFunc = this.boldMarkdown;
          break;
        case "italicize":
          prefixFunc = this.italicsMarkdown;
          suffixFunc = this.italicsMarkdown;
          break;
        case "link":
          prefixFunc = this.urlPrefixMarkdown;
          suffixFunc = this.urlSuffixMarkdown;
          break;
        default:
          // assume it's a reaction; there's no error handling here.
          prefixFunc = this.reactionMarkdown;
          suffixFunc = this.reactionMarkdown;
          break;
      }
      childEl.addEventListener(
        "click",
        () => {
          this.applyTextFormatting(prefixFunc, suffixFunc, innerTextFunc);
        },
        options
      );
    }

    // adding a post callback
    this.postForm.addEventListener(
      "submit",
      this.submitPost.bind(this),
      options
    );
    
    // click event listner for cancel button
    this.cancelReply.addEventListener(
      "click",
      this.replyToTopLevel.bind(this),
      options
    );

    getView().addLoadingListener(this);
  }

  /**
   * When the component is disconnected, abort the controller.
   */
  disconnectedCallback(): void {
    slog.info("PostEditor: removed from the DOM");
    this.controller?.abort();
    this.controller = null;
  }

  /**
   * Format the text formatting of bold, italics, and hyperlink.
   * @param prefixFunc a string function that contains prefix of formatting
   * @param suffixFunc a string function that contains suffix of formatting
   * @param selectedValFunc a string function that contains the text for formatting.
   */
  applyTextFormatting(
    prefixFunc: StringFunction,
    suffixFunc: StringFunction,
    selectedValFunc: StringFunction
  ) {
    let startCharIdx = this.postInput.selectionStart;
    let endCharIdx = this.postInput.selectionEnd;
    this.postInput.value =
      this.postInput.value.substring(0, startCharIdx) +
      prefixFunc() +
      selectedValFunc() +
      suffixFunc() +
      this.postInput.value.substring(endCharIdx);
  }

  /**
   * Submit a post by dispatching a createPost event.
   * @param event SubmitEvent of clicking the sumbit button
   */
  submitPost(event: SubmitEvent) {
    slog.info("submitPost: called");
    event.preventDefault();

    // Make a create post event 
    const postData = this.postInput.value;
    if (this.parentPath === undefined) {
      throw Error("error: submitPost: this.parentPath is undefined");
    }
    let id = String(Date.now());
    const createPostEvent = new CustomEvent("createPostEvent", {
      detail: { msg: postData, parent: this.parentPath, id },
    });
    slog.info("submitPost", [
      "createPostEvent.detail",
      `${JSON.stringify(createPostEvent.detail)}`,
    ]);
    // The submit buttons changes to loading 
    this.submitPostButton.setAttribute("disabled", "");
    this.submitPostIcon.setAttribute("icon", "svg-spinners:180-ring-with-bg");
    getView().waitForEvent(id, (evt, err) => {
      this.submitPostIcon.setAttribute("icon", "tabler:send");
      this.submitPostButton.removeAttribute("disabled");
    });

    // Dispatch the create post event 
    document.dispatchEvent(createPostEvent);

    // Clear the textarea
    this.postInput.value = "";
  }

  /**
   * Markdown for reactions.
   * @returns string ":"
   */
  reactionMarkdown() {
    return ":";
  }

  /**
   * Markdown for bold.
   * @returns string "**"
   */
  boldMarkdown() {
    return "**";
  }

  /**
   * Markdown for italics.
   * @returns string "*"
   */
  italicsMarkdown() {
    return "*";
  }

  /**
   * Markdown for ulr prefix.
   * @returns string "["
   */
  urlPrefixMarkdown() {
    return "[";
  }

  /**
   * Markdown for url suffix.
   * @returns string "]()"
   */
  urlSuffixMarkdown() {
    return "]()";
  }

  /**
   * Set the parent path and the postComponent of this post editor to the input.
   * @param parentPath string for new parent path
   * @param parentPost PostComponent of new post
   */
  setParentPath(parentPath: string, parentPost: PostComponent | null) {
    // Unhighlight the current parentPost of post editor
    if (this.parentPost !== null) {
      this.parentPost.unhighlight();
    }
    // Update the new parentPath and parentPost
    slog.info(
      "setParentPath",
      ["parentPath", `${parentPath}`],
      ["parentPost", parentPost]
    );
    this.parentPath = parentPath;
    this.parentPost = parentPost;
  }

  /**
   * Set the topreply elemet to the given element. 
   * @param topReplyEl HTMLElement for top reply element 
   */
  
  setTopReplyEl(topReplyEl: HTMLElement) {
    this.topReplyEl = topReplyEl;
  }

  /**
   * When the post editor moves back to the top level (default level),
   * remove highlight, reset parent path and reset the text area.
   * @param event MouseEvent for click
   */
  replyToTopLevel(event: MouseEvent) {
    if (this.parentPost !== null) {
      this.parentPost.unhighlight();
    }
    this.topReplyEl?.append(this);
    this.parentPath = "";
    this.postInput.value = "";
  }

  /**
   * Slog the parent post info.
   */
  printParentEl() {
    slog.info(
      "printParentEl",
      ["postEditor parent", `${JSON.stringify(this.parentNode)}`],
      ["postEditor", `${JSON.stringify(this)}`]
    );
  }

  /**
   * Set the text in the textarea to the input string.
   * @param text string for text in the textarea
   */
  setText(text: string) {
    this.postInput.value = text;
  }

  /**
   * When loading, disable the submit button 
   * @param state StateName
   */
  onLoading(state: StateName) {
    if (state === "channels" || state === "workspaces" || state === "user") {
      this.submitPostButton.setAttribute("disabled", "");
    }
  }

  /**
   * View calls this when the adapter marks any piece of state as done loading
   * @param state StateName
   */
  onEndLoading(state: StateName) {
    if (state === "channels" || state === "workspaces" || state === "user") {
      this.submitPostButton.removeAttribute("disabled");
    }
  }
}

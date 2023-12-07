import { slog } from "../../../../../slog";
import { StateName } from "../../../../datatypes";
import { getView } from "../../../../view";
import PostComponent from "../postComponent";

type StringFunction = () => string;

export class PostEditor extends HTMLElement {
  // TODO: can definitely add abortcontroller for event handlers and
  // 'deregistering' the event handlers here.

  private controller: AbortController | null = null;

  private postOperations: HTMLElement;

  // TODO: can we make this more generic?
  private postInput: HTMLTextAreaElement;

  private postForm: HTMLFormElement;

  private parentPath: string | undefined;

  private cancelReply: HTMLElement;

  private topReplyEl: HTMLElement | undefined;

  private submitPostIcon: HTMLElement;
  private submitPostButton: HTMLElement;
  private parentPost: PostComponent | null = null;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

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

    this.postOperations = postOperations;
    this.postInput = postInput;
    this.postForm = postForm;
    this.cancelReply = cancelReply;
    this.submitPostButton = submitPostButton;
    this.submitPostIcon = submitPostIcon;
  }

  connectedCallback() {
    // post editor operation callbacks
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };

    slog.info("postEditor added to the DOM");
    let postOperationElements = this.postOperations.children;
    for (let childEl of postOperationElements) {
      let id = childEl.id;
      let splitId = id.split("-");
      let operationType = splitId[1];
      let innerTextFunc: StringFunction;
      let prefixFunc: StringFunction;
      let suffixFunc: StringFunction;
      switch (operationType) {
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

    this.cancelReply.addEventListener(
      "click",
      this.replyToTopLevel.bind(this),
      options
    );

    getView().addLoadingListener(this);
  }

  disconnectedCallback(): void {
    slog.info("PostEditor: removed from the DOM");
    this.controller?.abort();
    this.controller = null;
  }

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

  submitPost(event: SubmitEvent) {
    slog.info("submitPost: called");
    event.preventDefault();
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
    this.submitPostIcon.setAttribute("icon", "svg-spinners:180-ring-with-bg");
    getView().waitForEvent(id, (evt, err) => {
      this.submitPostIcon.setAttribute("icon", "tabler:send");
    });
    document.dispatchEvent(createPostEvent);
    this.postInput.value = "";
  }

  reactionMarkdown() {
    return ":";
  }

  boldMarkdown() {
    return "**";
  }

  italicsMarkdown() {
    return "*";
  }

  urlPrefixMarkdown() {
    return "[";
  }

  urlSuffixMarkdown() {
    return "]()";
  }

  setParentPath(parentPath: string, parentPost: PostComponent | null) {
    // Unhighlight the current parentPost of post editor
    if (this.parentPost !== null) {
      this.parentPost.unhighlight();
    }
    // Update the new parentPath and parentPost 
    slog.info("setParentPath", ["parentPath", `${parentPath}`], ["parentPost", parentPost]);
    this.parentPath = parentPath;
    this.parentPost = parentPost;
  }

  setTopReplyEl(topReplyEl: HTMLElement) {
    this.topReplyEl = topReplyEl;
  }

  replyToTopLevel(event: MouseEvent) {
    if (this.parentPost !== null) {
      this.parentPost.unhighlight();
    }
    this.topReplyEl?.append(this);
    this.parentPath = "";
    this.postInput.value = "";
  }

  printParentEl() {
    slog.info(
      "printParentEl",
      ["postEditor parent", `${JSON.stringify(this.parentNode)}`],
      ["postEditor", `${JSON.stringify(this)}`]
    );
  }

  setText(text: string) {
    this.postInput.value = text;
  }

  onLoading(state: StateName) {
    if (state == "posts") {
      this.submitPostButton.setAttribute("disabled", "");
    }
  }

  onEndLoading(state: StateName) {
    if (state == "posts") {
      this.submitPostButton.removeAttribute("disabled");
    }
  }
}

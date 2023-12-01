import { slog } from "../../../../../slog";

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

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    let template = document.querySelector("#post-editor-template");

    if (!(template instanceof HTMLTemplateElement)) {
      throw Error("post editor template was not found");
    }

    if (this.shadowRoot === null) {
      throw Error(
        "could not find shadow DOM root for post-editor element in constructor",
      );
    }

    this.shadowRoot.append(template.content.cloneNode(true));

    let postOperations = this.shadowRoot.querySelector("#post-operations");
    let postInput = this.shadowRoot.querySelector("#post-input");
    let postForm = this.shadowRoot.querySelector("#post-form");

    if (!(postOperations instanceof HTMLElement)) {
      throw Error("Could not find an element with the post-operations id");
    }
    if (!(postInput instanceof HTMLTextAreaElement)) {
      throw Error("Could not find a text area element with the post-input id");
    }

    if (!(postForm instanceof HTMLFormElement)) {
      throw Error("Could not find an element with the post-form id");
    }

    this.postOperations = postOperations;
    this.postInput = postInput;
    this.postForm = postForm;
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
            `post editor connected callback: expected id of post operation to be of the form <operation>-text or <operation>-reaction, but id is: ${id}`,
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
        options,
      );
    }

    // adding a post callback
    this.postForm.addEventListener(
      "submit",
      this.submitPost.bind(this),
      options,
    );
  }

  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }

  applyTextFormatting(
    prefixFunc: StringFunction,
    suffixFunc: StringFunction,
    selectedValFunc: StringFunction,
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
    const createPostEvent = new CustomEvent("createPostEvent", {
      detail: { msg: postData, parent: this.parentPath },
    });
    slog.info("submitPost", [
      "createPostEvent.detail",
      `${JSON.stringify(createPostEvent.detail)}`,
    ]);
    document.dispatchEvent(createPostEvent);
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

  setParentPath(parentPath: string) {
    slog.info("setParentPath", ["parentPath", `${parentPath}`]);
    this.parentPath = parentPath;
  }

  printParentEl() {
    slog.info(
      "printParentEl",
      ["postEditor parent", `${JSON.stringify(this.parentNode)}`],
      ["postEditor", `${JSON.stringify(this)}`],
    );
  }
}

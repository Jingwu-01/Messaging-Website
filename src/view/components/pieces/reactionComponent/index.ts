import { slog } from "../../../../slog";
import { ReactionUpdateEvent } from "../../../datatypes";
import { getView } from "../../../view";

type reactions = "smile" | "frown" | "like" | "celebrate";

class ReactionComponent extends HTMLElement {
  private controller: AbortController | null = null;
  private reactionIcon: HTMLElement;
  private reactionButton: HTMLButtonElement;

  private reactionName: reactions = "smile";
  private count: number = 0;
  private parentPath: string | undefined;
  private curReacted: boolean = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    let template = document.querySelector("#reaction-component-template");
    if (!(template instanceof HTMLTemplateElement)) {
      throw Error("ReactionComponent: template was not found");
    }

    if (this.shadowRoot === null) {
      throw Error("ReactionComponent: no shadow root exists");
    }

    this.shadowRoot.append(template.content.cloneNode(true));

    const reactionButton = this.shadowRoot?.querySelector("#reaction-button");
    if (!(reactionButton instanceof HTMLButtonElement)) {
      throw new Error("reactionButton not HTML button element");
    }
  
    const reactionIcon = this.shadowRoot?.querySelector("#smile-reaction");
    if (!(reactionIcon instanceof HTMLElement)) {
      throw new Error("smileButton is not an HTMLElement");
    }

    this.reactionIcon = reactionIcon;
    this.reactionButton = reactionButton;
  }

  connectedCallback(): void {
    this.addReactionCount(this.count);

    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    this.reactionButton.addEventListener(
      "click",
      this.update.bind(this),
      options,
    );
  }

  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }

  update() {
    let user = getView().getUser();
    let postPath = this.parentPath;
    if (user === null) {
      getView().displayError("username isn't defined when reacting to a post");
      return;
    }
    if (postPath === undefined) {
      getView().displayError("reacted to a malformed post");
      return;
    }
    let updateEventContent: ReactionUpdateEvent = { reactionName: `${this.reactionName}`, userName: user.username, postPath: postPath, add: !this.curReacted};
    slog.info("ReactionComponent: update", ["updateEventContent", updateEventContent]);
    const reactionUpdateEvent = new CustomEvent("reactionUpdateEvent", {
      detail: updateEventContent,
    });
    document.dispatchEvent(reactionUpdateEvent);
  }

  addReactionCount(count: number): void {
    const countText = this.shadowRoot?.querySelector("#reaction-count");
    if (!(countText instanceof HTMLParagraphElement)) {
      throw new Error("countText is not an HTML paragraph element");
    } else {
      countText.innerHTML = count.toString();
      slog.info("addReactionCount: set count", [
        "countText.innerHTML",
        countText.innerHTML,
      ]);
    }
    slog.info("addReactionCount: after setting count", [
      "countText",
      countText,
    ]);
  }

  static get observedAttributes(): string[] {
    return ["icon", "reaction-count", "reacted"];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "icon") {
      // Adjust the corresponding arial-labels and reactionName correctly.
      if (newValue === "lucide:frown") {
        this.reactionButton.setAttribute("aria-label", "frown reaction");
        this.reactionName = "frown";
      } else if (newValue === "mdi:like-outline") {
        this.reactionButton.setAttribute("aria-label", "like reaction");
        this.reactionName = "like";
      } else if (newValue === "mingcute:celebrate-line") {
        this.reactionButton.setAttribute("aria-label", "celebrate reaction");
        this.reactionName = "celebrate";
      } else if (newValue === "lucide:smile") {
        this.reactionButton.setAttribute("aria-label", "smile reaction");
        this.reactionName = "smile";
      } else {
        slog.info("ReactionComponent: attributeChangedCallback", ["unsupportedReaction", ""]);
      }

      // Adjust the icon attribute to the newValue so that the appropriate iconify icon would be displayed.
      this.reactionIcon.setAttribute("icon", newValue);
    } else if (name === "reaction-count") {
      slog.info("attributeChangedCallback: reaction-count");
      let numReactionCount = parseInt(newValue);
      this.count = numReactionCount;
      this.addReactionCount(numReactionCount);
    } else if (name === "reacted") {
      // TODO: compare to the old values, and maybe unfreeze the button.
      if (newValue === "true") {
        this.curReacted = true;
        this.reactionButton.classList.add("reacted");
      } else {
        this.curReacted = false;
        this.reactionButton.classList.remove("reacted");
      }
    }
  }

  setParentPath(parentPath: string) {
    this.parentPath = parentPath;
  }
}

export default ReactionComponent;

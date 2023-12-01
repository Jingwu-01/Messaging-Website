import { slog } from "../../../../slog";

type reactions = "smile" | "frown" | "like" | "celebrate";

class ReactionComponent extends HTMLElement {
  private controller: AbortController | null = null;
  private reactionIcon: HTMLElement;
  private reactionButton: HTMLButtonElement;

  private reactionName: reactions = "smile";
  private count: number = 0;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    if (this.shadowRoot) {
      let template = document.querySelector("#reaction-component-template");
      if (!(template instanceof HTMLTemplateElement)) {
        throw new Error("reaction template is not HTML template element");
      } else {
        this.shadowRoot.append(template.content.cloneNode(true));
      }
    }

    const reactionButton = this.shadowRoot?.querySelector("#reaction-button");
    if (!(reactionButton instanceof HTMLButtonElement)) {
      throw new Error("reactionButton not HTML button element");
    }
    this.reactionButton = reactionButton;

    const reactionIcon = this.shadowRoot?.querySelector("#smile-reaction");
    if (!(reactionIcon instanceof HTMLElement)) {
      throw new Error("smileButton is not an HTMLElement");
    }
    this.reactionIcon = reactionIcon;
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
    const reactionUpdateEvent = new CustomEvent("reactionUpdateEvent", {
      detail: { reactionName: `${this.reactionName}` },
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
    return ["icon", "reaction-count"];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "icon") {
      // Adjust the corresponding arial-labels and reactionName correctly.
      if (newValue == "lucide:frown") {
        this.reactionButton.setAttribute("aria-label", "frown reaction");
        this.reactionName = "frown";
      } else if (newValue == "mdi:like-outline") {
        this.reactionButton.setAttribute("aria-label", "like reaction");
        this.reactionName = "like";
      } else if (newValue == "mingcute:celebrate-line") {
        this.reactionButton.setAttribute("aria-label", "celebrate reaction");
        this.reactionName = "celebrate";
      } else {
        throw new Error(newValue + " is not a valid iconify id.");
      }

      // Adjust the icon attribute to the newValue so that the appropriate iconify icon would be displayed.
      this.reactionIcon.setAttribute("icon", newValue);
    } else if (name === "reaction-count") {
      slog.info("attributeChangedCallback: reaction-count");
      let numReactionCount = parseInt(newValue);
      this.count = numReactionCount;
      this.addReactionCount(numReactionCount);
    }
  }
}

export default ReactionComponent;

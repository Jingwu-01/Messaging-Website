import { slog } from "../../../../slog";

type reactions = "smile" | "frown" | "like" | "celebrate";

class ReactionComponent extends HTMLElement {
  private controller: AbortController | null = null;

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
  }

  connectedCallback(): void {
    this.addReactionCount(this.count);

    this.controller = new AbortController();
    const options = { signal: this.controller.signal };

    const reactionButton = this.shadowRoot?.querySelector("#reaction-button");
    if (!(reactionButton instanceof HTMLButtonElement)) {
      throw new Error("reactionButton not HTML button element");
    }
    reactionButton.addEventListener("click", this.update.bind(this), options);
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
    slog.info("addReactionCount: before setting count", ["count", count]);
    const countText = this.shadowRoot?.querySelector("#count");
    if (!(countText instanceof HTMLParagraphElement)) {
      throw new Error("countText is not an HTML paragraph element");
    } else {
      countText.innerHTML = count.toString();
      slog.info("addReactionCount: set count", ["countText.innerHTML", countText.innerHTML]);
    }
    slog.info("addReactionCount: after setting count", ["countText", countText]);
  }

  static get observedAttributes(): string[] {
    return ["icon", "reaction-count"];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "icon") {
      if (newValue == "lucide:frown") {
        this.reactionName = "frown";
      } else if (newValue == "mdi:like-outline") {
        this.reactionName = "like";
      } else if (newValue == "mingcute:celebrate-line") {
        this.reactionName = "celebrate";
      } else {
        // TODO: don't throw an error; do something more graceful. just ignore it
        throw new Error(newValue + " is not a valid iconify id.");
      }
  
      const smileReaction = this.shadowRoot?.querySelector("#reaction-icon");
      if (!(smileReaction instanceof HTMLElement)) {
        throw new Error("smileButton is not an HTMLElement");
      }
      smileReaction.remove();
  
      const reactionButton = this.shadowRoot?.querySelector("#reaction-button");
      if (!(reactionButton instanceof HTMLButtonElement)) {
        throw new Error("reactionButton is not an HTMLButton Element");
      }
      const iconifyIcon = document.createElement("iconify-icon");
      iconifyIcon.setAttribute("icon", newValue);
      iconifyIcon.id = "reaction-icon";
      reactionButton.append(iconifyIcon);
    } else if (name === "reaction-count") {
      slog.info("attributeChangedCallback: reaction-count");
      let numReactionCount = parseInt(newValue);
      this.count = numReactionCount;
      this.addReactionCount(numReactionCount);
    }

  }
}

export default ReactionComponent;

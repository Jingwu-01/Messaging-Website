import { ViewPost } from "../../../datatypes";

class ReactionComponent extends HTMLElement {
  private controller: AbortController | null = null;
  private count: number = 0;
  private isClicked: Boolean = false;
  private reactionIcon: HTMLElement;

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
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };

    const reactionButton = this.shadowRoot?.querySelector("#reaction-button");
    if (!(reactionButton instanceof HTMLButtonElement)) {
      throw new Error("reactionButton not HTML button element");
    }
    reactionButton.addEventListener("click", this.update.bind(this), options);
    this.display();
  }

  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }

  update() {
    if (!this.isClicked) {
      this.isClicked = true;
      this.count++;
      this.display();
    } else {
      this.isClicked = false;
      this.count--;
      this.display();
    }
    const reactionUpdateEvent = new CustomEvent("reactionUpdateEvent", {
      detail: { reactionName: "dummyReactionName" },
    });
    document.dispatchEvent(reactionUpdateEvent);
  }

  display() {
    const countText = this.shadowRoot?.querySelector("#count");
    if (countText instanceof HTMLParagraphElement) {
      countText.innerHTML = this.count.toString();
    } else {
      throw new Error("countText not HTML paragraph element");
    }
  }

  addReactionContent(viewPost: ViewPost): void {
    let reactionData = viewPost.reactions; 

  }

  static get observedAttributes(): string[] {
    return ["icon"]
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
  }
}

export default ReactionComponent;

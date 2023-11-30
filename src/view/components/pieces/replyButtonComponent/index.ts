/* Defines the custom element for ReplyButtonComponent, which will be used as a reply button web component. */
class ReplyButtonComponent extends HTMLElement {
  private controller: AbortController | null = null;

  // Constructor for the ReplyButtonComponent
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Deep clone the reply button HTML template for later use.
    if (this.shadowRoot) {
      let template = document.querySelector("#reply-button-component-template");
      if (!(template instanceof HTMLTemplateElement)) {
        throw new Error("reply button template is not HTML template element");
      }
      this.shadowRoot.append(template.content.cloneNode(true));
    }
  }

  // When connected, create and assign a new AbortController.
  connectedCallback(): void {
    this.controller = new AbortController();
  }

  // When disconnected, abort the AbortController.
  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }
}

export default ReplyButtonComponent;

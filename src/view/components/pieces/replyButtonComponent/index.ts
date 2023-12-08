/**
 * ReplyButtonComponent is a reply button for posts. When a user clicks on it, the post editor will show.
 */ 
class ReplyButtonComponent extends HTMLElement {
  /** controller */
  private controller: AbortController | null = null;

  /**
   * Constructor for the ReplyButtonComponent
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    let template = document.querySelector("#reply-button-component-template");
    if (!(template instanceof HTMLTemplateElement)) {
      throw new Error("ReplyButtonComponent: template was not found");
    }

    if (this.shadowRoot === null) {
      throw new Error("ReplyButtonComponent: no shadow root exists");
    }

    this.shadowRoot.append(template.content.cloneNode(true));
  }

  /** When connected, create and assign a new AbortController.*/ 
  connectedCallback(): void {
    this.controller = new AbortController();
  }

  /** When disconnected, abort the AbortController.*/
  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }
}

export default ReplyButtonComponent;

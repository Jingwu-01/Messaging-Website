/**
 * Defines the custom element for EditPostButtonComponent, which will be used
 * as a edit post button web component. */
class EditPostButtonComponent extends HTMLElement {
  private controller: AbortController | null = null;
  private editPostButton: HTMLButtonElement | null = null;

  // Constructor for the EditPostButtonComponent
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Deep clone the edit post button HTML template for later use.
    if (this.shadowRoot) {
      let template = document.querySelector(
        "#edit-post-button-component-template"
      );
      if (!(template instanceof HTMLTemplateElement)) {
        throw new Error(
          "edit post button template is not HTML template element"
        );
      }
      this.shadowRoot.append(template.content.cloneNode(true));

      let editPostButton = this.shadowRoot?.querySelector("#edit-post-button");
      if (!(editPostButton instanceof HTMLButtonElement)) {
        throw new Error("edit post button is not an HTML button element");
      }
      this.editPostButton = editPostButton;
    }
  }

  // When connected, create and assign a new AbortController.
  connectedCallback(): void {
    if (this.editPostButton) {
      this.controller = new AbortController();
      const options = { signal: this.controller.signal };
      this.editPostButton.addEventListener(
        "click",
        this.editPost.bind(this),
        options
      );
    }
  }

  // When disconnected, abort the AbortController.
  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }

  private editPost(event: MouseEvent) {}
}

export default EditPostButtonComponent;

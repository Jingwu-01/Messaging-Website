class HoverComponent extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#hover-component-template"
    );
    if (!template) {
      throw Error("Could not find template #hover-component-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));
  }

  connectedCallback(): void {
    // The browser calls this when the element is added to a document.

    // Add a hover listener to the anchor element that opens the hover component.
    this.shadowRoot
      ?.querySelector("#popover")
      ?.addEventListener("mouseover", (event: Event) => {
        let popover_el = this.shadowRoot?.querySelector("#popover");
        popover_el?.setAttribute("open", "true");
      });

    // Add a hover listener to the hover component.
    // Make it so that the document doesn't close the hover.
    this.shadowRoot
      ?.querySelector("#popover")
      ?.addEventListener("mouseout", (event: Event) => {
        let popover_el = this.shadowRoot?.querySelector("#popover");
        popover_el?.setAttribute("open", "false");
      });
  }

  disconnectedCallback(): void {
    // The browser calls this when the element is removed from a document.
  }
  static get observedAttributes(): Array<string> {
    // Attributes to observe
    return ["align"];
  }
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (name == "align") {
      this.shadowRoot
        ?.querySelector("#popover")
        ?.setAttribute("align", newValue);
    }
  }
}

export default HoverComponent;

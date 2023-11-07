class MenuComponent extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#menu-component-template"
    );
    if (!template) {
      throw Error("Could not find template #dropdown-component-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));
  }

  connectedCallback(): void {
    // The browser calls this when the element is added to a document.

    // Add a click listener to the document that closes this menu if it isn't open.
    // This means clicking outside the menu will close it.
    window.addEventListener("click", () => {
      let popover_el = this.shadowRoot?.querySelector("#popover");
      if (popover_el?.getAttribute("open") == "true") {
        popover_el?.setAttribute("open", "false");
      }
    });

    // Add a click listener to the anchor element that opens the menu.
    this.shadowRoot
      ?.querySelector("#anchor-el-wrapper")
      ?.addEventListener("click", (event: Event) => {
        let popover_el = this.shadowRoot?.querySelector("#popover");
        popover_el?.setAttribute("open", "true");
        event.stopPropagation();
      });
  }

  disconnectedCallback(): void {
    // The browser calls this when the element is removed from a document.
  }
  static get observedAttributes(): Array<string> {
    // Attributes to observe
    return [];
  }
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {}
}

export default MenuComponent;

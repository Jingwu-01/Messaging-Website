class MenuComponent extends HTMLElement {
  private popoverElement: HTMLElement;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#menu-component-template"
    );
    if (!template) {
      throw Error("Could not find template #hover-component-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));

    let popover_el = this.shadowRoot?.querySelector("#popover");
    if (!(popover_el instanceof HTMLElement)) {
      throw Error("Could not find element #popover");
    }
    this.popoverElement = popover_el;
  }

  connectedCallback(): void {
    // The browser calls this when the element is added to a document.

    // Add a click listener to the document that closes this menu if it isn't open.
    // This means clicking outside the menu will close it.
    window.addEventListener("click", () => {
      this.popoverElement.setAttribute("open", "false");
    });

    // Add a click listener to the anchor element that opens the menu.
    this.shadowRoot
      ?.querySelector("#anchor-el-wrapper")
      ?.addEventListener("click", (event: Event) => {
        this.popoverElement.setAttribute("open", "true");
        event.stopPropagation();
      });

    // Add a click listener to the menu itself so the menu will stay open when it's clicked.
    this.popoverElement.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  disconnectedCallback(): void {
    // The browser calls this when the element is removed from a document.
  }
  static get observedAttributes(): Array<string> {
    // Attributes to observe
    return ["open"];
  }
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (name == "open") {
      this.popoverElement.setAttribute("open", newValue);
    }
  }
}

export default MenuComponent;

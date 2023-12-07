/**
 * MenuComponent is a drop-down menu. When a user clicks on it, the elements of the menu will show. 
 */
class MenuComponent extends HTMLElement {
  private popoverElement: HTMLElement;

  /**
   * Constructor for the MenuComponent. 
   */
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

  /**
   * When the component is connected, add some event listners to window and menu. 
   */
  connectedCallback(): void {
   
    // Add a click listener to the document that closes this menu if it isn't open.
    // This means clicking outside the menu will close it.
    window.addEventListener("click", () => {
      this.popoverElement.setAttribute("open", "false");
    });

    // Add a click listener to the anchor element that opens or closes the menu.
    this.shadowRoot
      ?.querySelector("#anchor-el-wrapper")
      ?.addEventListener("click", (event: Event) => {
        const open =
          this.popoverElement.getAttribute("open") == "true" ? "false" : "true";
        this.popoverElement.setAttribute("open", open);
        event.stopPropagation();
      });

    // Add a click listener to the menu itself so the menu will stay open when it's clicked.
    this.popoverElement.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  /**
   * Observe the attribute open. 
   */
  static get observedAttributes(): Array<string> {
    // Attributes to observe
    return ["open"];
  }

  /**
   * When the open attribute changes, open or close the menu accordingly. 
   * @param name the name of attribute that changed
   * @param oldValue the old value of changed attribute
   * @param newValue the new value of chanegd attribute 
   */
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

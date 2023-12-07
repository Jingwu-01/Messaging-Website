/**
 * HoverComponent is a component that will do something when a user hovers over it. It is used to show the time of posts: when a user hovers over it, the detailed time will pop over. 
 */
class HoverComponent extends HTMLElement {
  /**
   * Defines the construtor for HoverComponent.
   */
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#hover-component-template",
    );
    if (!template) {
      throw Error("Could not find template #hover-component-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));
  }

  /**
   * When connected, add listeners to the #popover.*/
  connectedCallback(): void {
    // The browser calls this when the element is added to a document.

    // Add a hover listener to the anchor element that opens the hover component.
    this.shadowRoot
      ?.querySelector("#hovered-content")
      ?.addEventListener("mouseover", (event: Event) => {
        let popover_el = this.shadowRoot?.querySelector("#popover");
        popover_el?.setAttribute("open", "true");
      });

    // Add a hover listener to the hover component.
    // Make it so that the document doesn't close the hover.
    this.shadowRoot
      ?.querySelector("#hovered-content")
      ?.addEventListener("mouseout", (event: Event) => {
        let popover_el = this.shadowRoot?.querySelector("#popover");
        popover_el?.setAttribute("open", "false");
      });
  }

  /**
   * The browser calls this when the element is removed from a document.
   */
  disconnectedCallback(): void {
    // for extensibility
  }

  /**
   * Observe the align attribute.
   */
  static get observedAttributes(): Array<string> {
    // Attributes to observe
    return ["align"];
  }

  /**
   * When the align attribute changes, display the pop over element.
   * @param name the name of attribute that changed
   * @param oldValue the old value of changed attribute
   * @param newValue the new value of chanegd attribute 
   */
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string,
  ): void {
    if (name == "align") {
      this.shadowRoot
        ?.querySelector("#popover")
        ?.setAttribute("align", newValue);
    }
  }
}

export default HoverComponent;

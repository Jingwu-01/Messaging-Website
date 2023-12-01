/* Defines the custom element for PopoverComponent, which will be used as a popover component web component. */
class PopoverComponent extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#popover-component-template",
    );
    if (!template) {
      throw Error("Could not find template #popover-component-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));
  }

  connectedCallback(): void {
    // The browser calls this when the element is added to a document.
  }

  disconnectedCallback(): void {
    // The browser calls this when the element is removed from a document.
  }
  static get observedAttributes(): Array<string> {
    // Attributes to observe
    return ["open", "align"];
  }
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string,
  ): void {
    // The browser calls this when an observed attribute has been changed.
    // Open / close popover based on value of "open" attribute
    if (name == "open") {
      let popover_box_el = this.shadowRoot?.querySelector("#popover-box");
      if (newValue == "true") {
        // un-hide if opening
        popover_box_el?.removeAttribute("hidden");
      } else {
        // hide if closing
        popover_box_el?.setAttribute("hidden", "hidden");
      }
    }
    // Set alignment of popover box
    if (name == "align") {
      let new_style = "";
      switch (newValue) {
        case "top":
          new_style =
            "position: absolute; top: 0; transform: translateY(-100%)";
          break;
        case "bottom":
          new_style =
            "position: absolute; bottom: 0; transform: translateY(100%)";
          break;
        case "left":
          new_style =
            "position: absolute; top: 50%; transform: translate(-100%, -50%);";
          break;
        case "right":
          new_style =
            "position: absolute; top: 50%; right: 0; transform: translate(100%, -50%);";
          break;
      }
      this.shadowRoot
        ?.querySelector("#popover-box")
        ?.setAttribute("style", new_style);
    }
  }
}

export default PopoverComponent;

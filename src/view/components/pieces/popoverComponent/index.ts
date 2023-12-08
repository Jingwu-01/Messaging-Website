/**
 * PopoverComponent is used for elements that will pop over when some conditions are met. In the display of dates of posts, when a user
 * hovers over the date, the detailed time would pop over.
 */
class PopoverComponent extends HTMLElement {
  /**
   * Constructor for the Popover Component.
   */
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

  /**
   * Observe the attributes open and align if they change.
   */
  static get observedAttributes(): Array<string> {
    return ["open", "align"];
  }

  /**
   * Display the pop over box based on value of "open" attribute and set alignment of popover box based "align".
   * @param name the name of attribute that changes
   * @param oldValue the old value of chanegd attribute
   * @param newValue the new value of chanegd attribute
   */
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string,
  ): void {
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

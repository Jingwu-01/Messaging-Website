/**
 * SnackbarDisplayComponennt displays the snack bar for messages.
 * */
class SnackbarDisplayComponent extends HTMLElement {
  private display: HTMLElement;

  /**
   * Constructor for snack bar.
   */
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#snackbar-display-component-template",
    );
    if (!template) {
      throw Error(
        "Could not find template #snackbar-display-component-template",
      );
    }
    this.shadowRoot?.append(template.content.cloneNode(true));

    let display_query = this.shadowRoot?.querySelector("#display");
    if (!(display_query instanceof HTMLElement)) {
      throw new Error("Could not find element with id #display");
    }
    this.display = display_query;

    // If another element tries to insert a child, then
    // insert it into our display.
    this.appendChild = this.display.appendChild.bind(this.display);
  }
}

export default SnackbarDisplayComponent;

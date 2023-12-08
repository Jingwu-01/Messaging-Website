import { getView } from "../../../view";

/**
 * OpenDialogButtonComponent is a button that opens a dialog when a user clicks on it. It is used for opening edit workspace and edit channels dialogs.
 */
export class OpenDialogButtonComponent extends HTMLElement {
  dialog_id: string = "";

  /**
   * Constructor for the OpenDialogButtonComponent.
   */
  constructor() {
    super();

    this.attachShadow({ mode: "open", delegatesFocus: true });
    let template = document.querySelector<HTMLTemplateElement>(
      "#open-dialog-button-component-template",
    );
    if (!template) {
      throw Error(
        "Could not find template #open-dialog-button-component-template",
      );
    }
    this.shadowRoot?.append(template.content.cloneNode(true));
  }

  /**
   * When the OpenDialogButtonComponent is connected, add click event listener to the outer button.
   * */
  connectedCallback() {
    this.shadowRoot
      ?.querySelector("#outer-button")
      ?.addEventListener("click", () => {
        getView().openDialog(this.dialog_id);
      });
  }

  /**
   * Observe the changes of attributes dialog and style.
   */
  static get observedAttributes(): string[] {
    return ["dialog", "style"];
  }

  /**
   * Update the dialog id or adjust the style of the dialog when the observed attributes change.
   * @param name the name of changed attrbutes
   * @param oldValue the old value of changed attrbutes
   * @param newValue the new value of changed attrbutes
   */
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string,
  ): void {
    // When dialog attribute changes, update the dialog id.
    if (name == "dialog") {
      this.dialog_id = newValue;
    }
    // When style attribute chanegs, update the style of the outer button.
    if (name == "style") {
      this.shadowRoot
        ?.querySelector("#outer-button")
        ?.setAttribute("style", newValue);
    }
  }
}

export default OpenDialogButtonComponent;

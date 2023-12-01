import { getView } from "../../../view";

/* Defines the custom element for OpenDialogButtonComponent, which will be used as a openDialogbutton component web component. */
export class OpenDialogButtonComponent extends HTMLElement {
  dialog_id: string = "";

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#open-dialog-button-component-template"
    );
    if (!template) {
      throw Error(
        "Could not find template #open-dialog-button-component-template"
      );
    }
    this.shadowRoot?.append(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.shadowRoot
      ?.querySelector("#outer-button")
      ?.addEventListener("click", () => {
        getView().openDialog(this.dialog_id);
      });
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (name == "dialog") {
      this.dialog_id = newValue;
    }
    if (name == "style") {
      this.shadowRoot
        ?.querySelector("#outer-button")
        ?.setAttribute("style", newValue);
    }
  }

  static get observedAttributes(): string[] {
    return ["dialog", "style"];
  }
}

export default OpenDialogButtonComponent;

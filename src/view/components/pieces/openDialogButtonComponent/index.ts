import { getView } from "../../../view";

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
      ?.querySelector("#wrapper")
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
  }

  static get observedAttributes(): string[] {
    return ["dialog"];
  }
}

export default OpenDialogButtonComponent;

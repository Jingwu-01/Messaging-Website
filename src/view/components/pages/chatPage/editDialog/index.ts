// An EditDialog is a dialog that allows for the creation or deletion of channels or workspaces.
export class EditDialogComponent extends HTMLElement {
  public onAdd(new_item_name: string) {}
  public onRemove(item_id: string) {}

  private addItemForm: HTMLFormElement;
  private itemDisplay: HTMLDivElement;
  private dialog: HTMLDialogElement;
  private saveAndCloseButton: HTMLButtonElement;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#edit-dialog-component-template"
    );
    if (!template) {
      throw Error("Could not find template #app-bar-component-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));

    // Set up add item form
    let add_item_form_query = this.shadowRoot?.querySelector("#add-item-form");
    if (!(add_item_form_query instanceof HTMLFormElement)) {
      throw Error("Could not find form #add-item-form");
    }
    this.addItemForm = add_item_form_query;
    this.addItemForm.addEventListener("submit", () => {
      let data = new FormData(this.addItemForm);
      let name = data.get("new-item-name");
      if (!name) {
        throw Error("add-item-form has no input with name new-item-name");
      }
      this.onAdd(name.toString());
    });

    // Set up item display
    let item_display_query = this.shadowRoot?.querySelector("#item-display");
    if (!(item_display_query instanceof HTMLDivElement)) {
      throw Error("Could not find form #item-display");
    }
    this.itemDisplay = item_display_query;

    // Set up dialog
    let dialog_query = this.shadowRoot?.querySelector("dialog");
    if (!(dialog_query instanceof HTMLDialogElement)) {
      throw Error("Could not find a dialog element");
    }
    this.dialog = dialog_query;

    // Set up save and close button
    let save_and_close_button_query = this.shadowRoot?.querySelector(
      "#save-and-close-button"
    );
    if (!(save_and_close_button_query instanceof HTMLButtonElement)) {
      throw Error("Could not find a save and close button");
    }
    this.saveAndCloseButton = save_and_close_button_query;
  }

  connectedCallback(): void {
    this.saveAndCloseButton.addEventListener("click", () => {
      this.close();
    });
  }

  showModal() {
    this.dialog.showModal();
  }

  close() {
    this.dialog.close();
  }

  setItems(items: string[]) {
    console.log(items);
    this.itemDisplay.innerHTML = "";
    items.forEach((item_name, index) => {
      // maybe make this an actual web component instead of what we have?
      let new_item_element = document.createElement("div");
      new_item_element.innerHTML = `
        <p>${item_name}</p>
        <iconify-icon icon="material-symbols:delete" id="remove-item-${index}"></iconify-icon>
      `;
      new_item_element.classList.add("item");
      // if the remove button is presssed, then call our handleRemove() function on that item.
      // NOTE: doing things this way means that, if the onRemove() function changes after the
      // setItems() function is called, the rendered items will still be using the old function.
      new_item_element
        .querySelector(`#remove-item-${index}`)
        ?.addEventListener("click", () => {
          this.onRemove(item_name);
        });
      this.itemDisplay.appendChild(new_item_element);
    });
  }
}

export default EditDialogComponent;

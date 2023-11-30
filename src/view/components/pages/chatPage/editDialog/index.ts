// An EditDialog is a dialog that allows for the creation or deletion of channels or workspaces.
export class EditDialogComponent extends HTMLElement {
  public onAdd(new_item_name: string) {}
  public onRemove(item_id: string) {}

  private addItemButton: HTMLElement;
  private addItemInput: HTMLInputElement;
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
      throw Error("Could not find template #edit-dialog-component-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));

    // Set up add item input
    let add_item_input = this.shadowRoot?.querySelector("#add-item-input");
    if (!(add_item_input instanceof HTMLInputElement)) {
      throw Error("Could not find form #add-item-input");
    }
    this.addItemInput = add_item_input;

    // Set up add item button
    let add_item_button_query =
      this.shadowRoot?.querySelector("#add-item-button");
    if (!(add_item_button_query instanceof HTMLElement)) {
      throw Error("Could not find form #add-item-form");
    }
    this.addItemButton = add_item_button_query;

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
    this.addItemButton.addEventListener("click", () => {
      this.onAdd(this.addItemInput.value);
    });

    this.saveAndCloseButton.addEventListener("click", () => {
      this.close();
    });

    this.dialog?.addEventListener('keydown', (event) => {
      if (event.key === "Enter" && this.dialog?.open) {
        this.onAdd(this.addItemInput.value);
      }
    });
  }

  showModal() {
    this.dialog.showModal();
  }

  close() {
    this.dialog.close();
  }

  setItems(items: string[]) {
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

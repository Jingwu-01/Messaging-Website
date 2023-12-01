import { EventWithId } from "../../../../datatypes";

// An EditDialog is a dialog that allows for the creation or deletion of channels or workspaces.
export class EditDialogComponent extends HTMLElement {
  public getAddEvent(new_item_name: string): EventWithId | void {}
  public getRemoveEvent(item_id: string): EventWithId | void {}

  protected addItemButton: HTMLElement;
  protected addItemInput: HTMLInputElement;
  protected itemDisplay: HTMLDivElement;
  protected dialog: HTMLDialogElement;
  protected saveAndCloseButton: HTMLElement;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#edit-dialog-component-template",
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

    // Override the addEventListener method so that event listeners are added to the dialog.
    // This is so that other elements can listen to close events on this dialog.
    this.addEventListener = this.dialog.addEventListener.bind(this.dialog);
    // Override the default appendChild method so that the child gets added to our dialog.
    // This is so that the snackbar display can get moved into here.
    this.appendChild = this.dialog.appendChild.bind(this.dialog);

    // Set up save and close button
    let save_and_close_button_query = this.shadowRoot?.querySelector(
      "#save-and-close-button",
    );
    if (!(save_and_close_button_query instanceof HTMLElement)) {
      throw Error("Could not find a save and close button");
    }
    this.saveAndCloseButton = save_and_close_button_query;
  }

  connectedCallback(): void {
    this.addItemButton.addEventListener("click", () => {
      const event = this.getAddEvent(this.addItemInput.value);
      if (event) {
        this.addItemButton.setAttribute("loading-until-event", event.detail.id);
        this.saveAndCloseButton.setAttribute(
          "disabled-until-event",
          event.detail.id,
        );
        document.dispatchEvent(event);
      }
    });

    this.saveAndCloseButton.addEventListener("click", () => {
      this.close();
    });

    this.dialog?.addEventListener("keydown", (event) => {
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
        <loading-button-component id="remove-item-${index}">
          <iconify-icon icon="material-symbols:delete" slot="content"></iconify-icon>
        </loading-button-component>
      `;
      new_item_element.classList.add("item");
      // query the remove button
      const remove_button = new_item_element.querySelector(
        `#remove-item-${index}`,
      );
      if (!remove_button) {
        throw new Error("Failed to add remove button for new item");
      }
      remove_button.addEventListener("click", () => {
        // get the event we want to send to the adapter
        const event = this.getRemoveEvent(item_name);
        if (event) {
          console.log(event);
          // disable buttons to handle concurrency.
          this.addItemButton.setAttribute(
            "disabled-until-event",
            event.detail.id,
          );
          this.saveAndCloseButton.setAttribute(
            "disabled-until-event",
            event.detail.id,
          );
          remove_button.setAttribute("loading-until-event", event.detail.id);
          // dispatch the event.
          document.dispatchEvent(event);
        }
      });
      this.itemDisplay.appendChild(new_item_element);
    });
  }
}

export default EditDialogComponent;

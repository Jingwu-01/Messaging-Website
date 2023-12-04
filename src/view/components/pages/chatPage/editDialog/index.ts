import { EventWithId } from "../../../../datatypes";

/*
  An EditDialog is a dialog that allows for the creation or deletion of channels or workspaces.
*/
export class EditDialogComponent extends HTMLElement {
  /**
   * Called when the "add-item" form is filled out.
   * The returned event will be dispatched.
   * @param new_item_name Name of new item
   */
  public getAddEvent(new_item_name: string): EventWithId | void {}

  /**
   * Called when the "remove-item" form is filled out.
   * The returned event will be dispatched.
   * @param item_id Name of new item
   */
  public getRemoveEvent(item_id: string): EventWithId | void {}

  protected addItemButton: HTMLElement;
  protected addItemInput: HTMLInputElement;
  protected itemDisplay: HTMLDivElement;
  protected dialog: HTMLDialogElement;
  protected saveAndCloseButton: HTMLElement;

  /** Position (starting from top of dialog) of the element that's currently focused. */
  protected focused_element_index: number = 0;
  /** Elements representing this dialog's items */
  protected item_elements: HTMLElement[] = [];

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

    // Override the addEventListener method so that event listeners are added to the dialog.
    // This is so that other elements can listen to close events on this dialog.
    this.addEventListener = this.dialog.addEventListener.bind(this.dialog);
    // Override the default appendChild method so that the child gets added to our dialog.
    // This is so that the snackbar display can get moved into here.
    this.appendChild = this.dialog.appendChild.bind(this.dialog);

    // Set up save and close button
    let save_and_close_button_query = this.shadowRoot?.querySelector(
      "#save-and-close-button"
    );
    if (!(save_and_close_button_query instanceof HTMLElement)) {
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

    // TODO improve accessibility so that remove can be accessed with keyboard
    this.dialog.addEventListener("keydown", (event) => {
      if (!this.dialog?.open) {
        return;
      }

      // Handle enter press
      if (event.key == "Enter") {
        // Submit the add event if the currently-focused element is the add item
        // element.
        if (this.focused_element_index == this.item_elements.length) {
          this.onAdd(this.addItemInput.value);
        }
      }
      // Move the focused element up / down depending on arrow presses.
      if (event.key == "ArrowUp" && this.focused_element_index > 0) {
        this.setFocusedElement(this.focused_element_index - 1);
      }
      if (
        event.key == "ArrowDown" &&
        this.focused_element_index < this.item_elements.length + 1
      ) {
        this.setFocusedElement(this.focused_element_index + 1);
      }
    });
  }

  /**
   * Opens the edit dialog
   */
  showModal() {
    this.dialog.showModal();
    this.setFocusedElement(this.item_elements.length);
  }

  /**
   * Closes the edit dialog
   */
  close() {
    this.dialog.close();
  }

  /**
   * Displays each of the given items, with remove buttons next to them
   * so that they can be deleted.
   * @param items Items to display
   */
  setItems(items: string[]) {
    let item_elements: HTMLElement[] = [];
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
        `#remove-item-${index}`
      );
      if (!remove_button) {
        throw new Error("Failed to add remove button for new item");
      }
      remove_button.addEventListener("click", () => {
        // get the event we want to send to the adapter
        const event = this.getRemoveEvent(item_name);
        if (event) {
          // disable buttons to handle concurrency.
          this.addItemButton.setAttribute(
            "disabled-until-event",
            event.detail.id
          );
          this.saveAndCloseButton.setAttribute(
            "disabled-until-event",
            event.detail.id
          );
          remove_button.setAttribute("loading-until-event", event.detail.id);
          // dispatch the event.
          document.dispatchEvent(event);
        }
      });
      this.itemDisplay.appendChild(new_item_element);
      item_elements.push(new_item_element);
    });
    this.item_elements = item_elements;
    this.setFocusedElement(this.focused_element_index);
  }

  /**
   * Called when the add-item-form is submitted.
   * @param new_item_name Name of the new item that was added.
   */
  onAdd(new_item_name: string) {
    const event = this.getAddEvent(new_item_name);
    if (event) {
      this.addItemInput.value = "";
      this.addItemButton.setAttribute("loading-until-event", event.detail.id);
      this.saveAndCloseButton.setAttribute(
        "disabled-until-event",
        event.detail.id
      );
      document.dispatchEvent(event);
    }
  }

  /**
   * Focuses the index'th element from the top of the dialog
   * @param index The index of the element to focus.
   */
  setFocusedElement(index: number) {
    this.focused_element_index = index;

    // 0 --> this.item_elements.length - 1: it's one of the items
    if (this.focused_element_index < this.item_elements.length) {
      const item_remove_button = this.shadowRoot?.querySelector(
        `#remove-item-${this.focused_element_index}`
      );
      if (!(item_remove_button instanceof HTMLElement)) {
        throw new Error("Item does not have a remove button");
      }
      item_remove_button.focus();
    }
    // this.item_elements.length: it's the add item input
    else if (this.focused_element_index == this.item_elements.length) {
      this.addItemInput.focus();
    }
    // this.item_elements.length + 1: it's the save and close button
    else {
      this.saveAndCloseButton.focus();
    }
  }
}

export default EditDialogComponent;

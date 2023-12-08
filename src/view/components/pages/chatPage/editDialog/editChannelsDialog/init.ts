import { EditChannelsDialogComponent } from ".";

/**
 * Initialize the EditChannelsDialog component and register the custom element.
 */
export default function editChannelsDialogComponentInit() {
  customElements.define(
    "edit-channels-dialog-component",
    EditChannelsDialogComponent,
  );
}

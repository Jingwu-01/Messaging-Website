import OpenDialogButtonComponent from ".";

/**
 * Initialize the HTML template for open dialog component and register the open dialog component custom element.
 */
export function openDialogButtonComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
  <template id="open-dialog-button-component-template">
    <style>
      button {
        background-color: #add8e6;
        border-radius: 15px;
      }
      button:focus-visible {
        box-shadow: #ff0000 0 0 0 3px;
        outline: none;
      }
      button:focus:not(:focus-visible) {
        box-shadow: none;
        outline: none;
      }
    </style>
    <button id="outer-button">
      <slot name="button-content"></slot>
    </button>
  </template>
`,
  );

  customElements.define(
    "open-dialog-button-component",
    OpenDialogButtonComponent,
  );
}

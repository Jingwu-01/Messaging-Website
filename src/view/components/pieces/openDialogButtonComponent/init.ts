import OpenDialogButtonComponent from ".";

/* Initializes the HTML template for open dialog component and register the open dialog component custom element. */
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

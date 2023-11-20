import OpenDialogButtonComponent from ".";

export function openDialogButtonComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="open-dialog-button-component-template">
  <style>
    #wrapper {
      display: inline-block
    }
  </style>
  <div id="wrapper">
    <slot name="button-content"></slot>
  </div>
</template>
`
  );

  customElements.define(
    "open-dialog-button-component",
    OpenDialogButtonComponent
  );
}

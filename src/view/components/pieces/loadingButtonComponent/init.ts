import LoadingButtonComponent from ".";

export default function loadingButtonComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="loading-button-component-template">
  <style>
  </style>
  <button id="outer-button">
    <slot id="content" name="content"></slot>
    <span id="loading-text" hidden>Loading...</span>
  </button>
</template>
`
  );

  customElements.define("loading-button-component", LoadingButtonComponent);
}

import LoadingButtonComponent from ".";

export default function loadingButtonComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="loading-button-component-template">
  <style>
  button {
    background-color: #add8e6;
    border-radius: 15px;
  }
  </style>
  <button id="outer-button">
    <slot id="content" name="content"></slot>
    <div id="loading-text" hidden>
      <iconify-icon icon="svg-spinners:180-ring-with-bg" aria-label="Loading..."></iconify-icon>
    </div>
  </button>
</template>
`
  );

  customElements.define("loading-button-component", LoadingButtonComponent);
}

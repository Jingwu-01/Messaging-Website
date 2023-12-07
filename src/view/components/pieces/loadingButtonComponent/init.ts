import LoadingButtonComponent from ".";

/* Initializes the HTML template for loading button and register loading button custom element. */
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
  button:focus-visible {
    box-shadow: #FF0000 0 0 0 3px;
    outline: none;
}
  button:focus:not(:focus-visible) {
    box-shadow: none;
    outline: none;
} 
  </style>
  <button id="outer-button">
    <slot id="content" name="content"></slot>
    <section id="loading-text" hidden>
      <iconify-icon icon="svg-spinners:180-ring-with-bg" aria-label="Loading..."></iconify-icon>
    </section>
  </button>
</template>
`,
  );

  customElements.define("loading-button-component", LoadingButtonComponent);
}

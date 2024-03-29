import LoadingButtonComponent from ".";

/**
 * Initialize the HTML template for loading button and register loading button custom element.
 */
export default function loadingButtonComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="loading-button-component-template">
  <style>
  .loading-button {
    background-color: #add8e6;
    border-radius: 15px;
  }
  #outer-button:hover {
    background-color: #818589;
  }
  #outer-button:active {
    background-color: #818589;
  }
  #outer-button:focus-visible {
    box-shadow: #FF0000 0 0 0 3px;
    outline: none;
  }
  button:focus:not(:focus-visible) {
    box-shadow: none;
    outline: none;
  }
  </style>
  <button id="outer-button" class="loading-button">
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

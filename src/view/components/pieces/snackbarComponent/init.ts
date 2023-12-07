import SnackbarComponent from ".";

/**
 * Initialize the HTML template for snack bar and register the snack bar custom element.
 */
export default function snackbarInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
  <template id="snackbar-component-template">
    <style>
      #wrapper {
        animation: fade-in 0.5s;
        position: relative;
        display: inline-block;
      }
      #snackbar-content {
        display: flex;
        padding: 0px 20px;
        gap: 10px;
        align-items: center;
      }
      @keyframes fade-in {
        from {
          transform: translateX(100%);
          left: 3vh;
        }
        to {
          transform: translateX(0);
          left: 0;
        }
      }
      #close-button:focus-visible {
        box-shadow: #ff0000 0 0 0 3px;
        outline: none;
        border-radius: 3px;
      }
      #close-button:focus:not(:focus-visible) {
        box-shadow: none;
        outline: none;
      }
    </style>
    <section id="wrapper">
      <section id="snackbar-content">
        <slot name="content"></slot>
        <button id="close-button">
          <iconify-icon
            icon="material-symbols:close"
            aria-label="close"
          ></iconify-icon>
        </button>
      </section>
    </section>
  </template>
    `,
  );

  customElements.define("snackbar-component", SnackbarComponent);
}

import SnackbarDisplayComponent from ".";

/* Initializes the HTML template for snack bar display and register the snack bar display custom element. */
export default function snackbarDisplayInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
  <template id="snackbar-display-component-template">
    <div
      id="display"
      style="
        position: fixed;
        right: 3vw;
        bottom: 3vh;
        display: flex;
        flex-direction: column-reverse;
        gap: 1vh;
        animation: none;
        align-items: flex-end;
      "
    >
    </div>
  </template>
  `
  );

  customElements.define("snackbar-display-component", SnackbarDisplayComponent);
}

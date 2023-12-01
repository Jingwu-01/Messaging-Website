import SnackbarComponent from ".";

export default function snackbarInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <template id="snackbar-component-template">
      <style>
        #wrapper{
          display: flex;
          padding: 0px 20px;
          gap: 10px;
          align-items: center;
          animation: fade-in 0.5s;
          position: relative;
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
      </style>
      <div id="wrapper">
        <slot name="content"></slot>
        <button id="close-button">
          <iconify-icon icon="material-symbols:close" aria-label="close"></iconify-icon>
        </button>
      </div>
    </template>
    `,
  );

  customElements.define("snackbar-component", SnackbarComponent);
}

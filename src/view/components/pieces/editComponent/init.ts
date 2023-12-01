import EditPostButtonComponent from ".";

/**
 * Initializes the HTML template for edit post button and register the edit
 * post button custom element. */
export default function editPostButtonComponentInit() {
  // Add the edit post button HTML template to the document body.
  document.body.insertAdjacentHTML(
    "beforeend",
    `
  <template id="edit-post-button-component-template">
    <style>
      #edit-post-button {
        width: 30px;
        height: 30px;
        border-radius: 3px 3px 3px 3px;
        margin-left: 10px;
      }
      button:hover {
        background-color: #818589;
      }
      button:active {
        background-color: #5a5a5a;
      }
      button:focus-visible {
        box-shadow: rgba(60, 60, 60, 0.6) 0 0 0 3px;
        outline: none;
      }
      button:focus:not(:focus-visible) {
        box-shadow: none;
        outline: none;
      }
    </style>
    <button id="edit-post-button" aria-label="edit post">
      <iconify-icon icon="material-symbols:edit"></iconify-icon>
    </button>
  </template>
`
  );

  // Register the reply button component custom element.
  customElements.define("edit-post-button-component", EditPostButtonComponent);
}

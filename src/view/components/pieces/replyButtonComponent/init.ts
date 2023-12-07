import ReplyButtonComponent from ".";

/** Initialize the HTML template for reply button and register the reply button
 * custom element.
 */
export default function replyButtonComponentInit() {
  // Insert reply button HTML template to the document body.
  document.body.insertAdjacentHTML(
    "beforeend",
    `
  <template id="reply-button-component-template">
    <style>
      #reply-button {
        width: 30px;
        height: 30px;
        border-radius: 3px 3px 3px 3px;
        margin-right: 10px;
      }
      button:hover {
        background-color: #818589;
      }
      button:active {
        background-color: #5a5a5a;
      }
      button:focus-visible {
        box-shadow: #ff0000 0 0 0 3px;
        outline: none;
      }
      button:focus:not(:focus-visible) {
        box-shadow: none;
        outline: none;
      }
    </style>
    <button id="reply-button" aria-label="reply">
      <iconify-icon icon="material-symbols:reply"></iconify-icon>
    </button>
  </template>
`,
  );

  // Register the reply button component custom element.
  customElements.define("reply-button-component", ReplyButtonComponent);
}

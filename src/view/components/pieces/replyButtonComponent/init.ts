import ReplyButtonComponent from ".";

/* Initializes the HTML template for reply button and register the reply button custom element. */ 
export default function replyButtonComponentInit() {
  // Add the reply button HTML template to the document body. 
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <template id="reply-button-component-template">
    <style>
      #reply-button {
        width: 30px;
        height: 30px;
      }
    </style>
    <button id="reply-button">
      <iconify-icon icon="material-symbols:reply" aria-label="reply"></iconify-icon>
    </button>
  </template>

`
  );
  
  // Register the reply button component custom element. 
  customElements.define("reply-button-component", ReplyButtonComponent);
}

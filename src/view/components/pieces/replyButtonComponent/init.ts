import ReplyButtonComponent from ".";

/* Initialize the HTML for the reply button template and register the reply button custom element. */ 
export default function replyButtonComponentInit() {
  // Add the reply button HTML template to the document body. 
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <template id="reply-button-component-template">
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <style>
      #reply-button {
        width: 30px;
        height: 30px;
      }
    </style>
    <section>
      <button id="reply-button">
        <iconify-icon icon="material-symbols:reply"></iconify-icon>
      </button>
    </section>
  </template>  

`
  );
  
  // Register the reply button component custom element. 
  customElements.define("reply-button-component", ReplyButtonComponent);
}

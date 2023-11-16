import ReplyButtonComponent from ".";

export default function init() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <template id="reply-button-component-template">
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <style></style>
    <div> 
    <button id="reply-button"> 
    <iconify-icon icon="material-symbols:reply"></iconify-icon> 
    </button> 
    </div> 
  </template>

`
  );

  customElements.define("reply-button-component", ReplyButtonComponent);
}

import ReactionComponent from ".";

export default function reactionComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <template id="reaction-component-template">
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <style>
      #wrapper {
        display: flex;
        margin-left: 10px; 
      }
      #reaction-button {
        width: 30px;
        height: 30px;
      }
      #count {
        margin-left: 10px;
        margin-top: 7px;
      }
    </style>
    <div id="wrapper">
      <button id="reaction-button">
        <iconify-icon icon="lucide:smile" id="reaction-icon"></iconify-icon>
      </button>
      <p id="count"></p>
    </div>
    
  </template>

`
  );

  customElements.define("reaction-component", ReactionComponent);
}

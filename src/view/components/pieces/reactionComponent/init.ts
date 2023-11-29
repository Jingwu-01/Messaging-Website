import ReactionComponent from ".";

export default function reactionComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <template id="reaction-component-template">
    <style>
      #reaction-container {
        display: flex;
        margin-left: 10px;
      }
      #reaction-button {
        width: 30px;
        height: 30px;
      }
      #reaction-count {
        margin-left: 10px;
        margin-top: 7px;
      }
    </style>
    <div id="reaction-container">
      <button id="reaction-button">
        <iconify-icon icon="lucide:smile" id="smile-reaction"></iconify-icon>
      </button>
      <p id="reaction-count"></p>
    </div>
  </template>
  
`
  );

  customElements.define("reaction-component", ReactionComponent);
}

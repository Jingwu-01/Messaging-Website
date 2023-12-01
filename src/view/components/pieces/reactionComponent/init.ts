/* Initializes the HTML template for reaction component and register the reaction component custom element. */
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
        border-radius: 3px 3px 3px 3px;
      }
      #reaction-count {
        margin-left: 10px;
        margin-top: 7px;
      }
      #reaction-button:hover{
        background-color: #818589;
      }
      #reaction-button:active {
        background-color: #5a5a5a;
      }
      .reacted {
        background-color: #add8e6
      }
    </style>
    <div id="reaction-container">
      <button id="reaction-button" aria-label="smile reaction">
        <iconify-icon icon="lucide:smile" id="smile-reaction"></iconify-icon>
      </button>
      <p id="reaction-count"></p>
    </div>
  </template>
  
`,
  );

  customElements.define("reaction-component", ReactionComponent);
}

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
      #reaction-button-content {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
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
      #reaction-button:focus-visible {
        box-shadow: #FF0000 0 0 0 3px;
        outline: none;
      }
      #reaction-button:focus:not(:focus-visible) {
        box-shadow: none;
        outline: none;
      }
    </style>
    <div id="reaction-container">
      <loading-button-component disable-if-state-loading="posts" id="reaction-button" aria-label="smile reaction" style="padding: 0;" default-button-styles="true">
        <div id="reaction-button-content" slot="content">
          <iconify-icon slot="content" icon="lucide:smile" id="smile-reaction"></iconify-icon>
        </div>
      </loading-button-component>
      <p id="reaction-count"></p>
    </div>
  </template>
  
`
  );

  customElements.define("reaction-component", ReactionComponent);
}

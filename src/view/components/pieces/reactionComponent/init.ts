import ReactionComponent from ".";

/**
 * Initialize the HTML template for reaction component and register the
 * reaction component custom element.
 */
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
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px 3px 3px 3px;
        border-style: outset;
        border-color: buttonborder;
        border-image: initial;
        border-width: 2px;
        background-color: buttonface;
      }
      #reaction-count {
        margin-left: 10px;
        margin-top: 7px;
      }
      #reaction-button-content:hover {
        background-color: #818589;
        border-radius: 3px 3px 3px 3px;
      }
      #reaction-container button:active {
        background-color: #5a5a5a;
        border-radius: 3px 3px 3px 3px;
      }
      .reacted {
        background-color: #add8e6;
      }
      #reaction-container button:focus-visible {
        box-shadow: #ff0000 0 0 0 3px;
        outline: none;
        border-radius: 3px 3px 3px 3px;
      }
      #reaction-container button:focus:not(:focus-visible) {
        box-shadow: none;
        outline: none;
      }
      
    </style>
    <section id="reaction-container">
      <loading-button-component disable-if-state-loading="posts" id="reaction-button" aria-label="smile reaction" style="border: 0px; background-color: transparent; }" default-button-styles="true">
        <section id="reaction-button-content" slot="content">
          <iconify-icon slot="content" icon="lucide:smile" id="smile-reaction"></iconify-icon>
        </section>
      </loading-button-component>
      <p id="reaction-count"></p>
    </section>
  </template>
  
`
  );

  customElements.define("reaction-component", ReactionComponent);
}

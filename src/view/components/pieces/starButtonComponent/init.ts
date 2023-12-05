import StarButtonComponent from ".";

export default function starButtonInit() {
    document.body.insertAdjacentHTML(
        "beforeend",
    `
    <template id="star-button-component-template">
    <style>
      #star-button {
        width: 30px;
        height: 30px;
        border-radius: 3px 3px 3px 3px;
        margin-right: 10px; 
      }
      button:hover{
        background-color: #818589;
      }
      button:active {
        background-color: #5a5a5a;
      }
      button:focus-visible {
        box-shadow: #FF0000 0 0 0 3px;
        outline: none;
      }
      button:focus:not(:focus-visible) {
        box-shadow: none;
        outline: none;
      }
      .reacted {
        background-color: #add8e6;
      }
    </style>
    <button id="star-button" aria-label="star-post">
      <iconify-icon id="star-icon" icon="material-symbols:star-outline"></iconify-icon>
    </button>
  </template>

`
    );

    customElements.define("star-button-component", StarButtonComponent);
}

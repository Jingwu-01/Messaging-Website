import ReactionComponent from ".";

export default function init() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <template id="reaction-component-template">
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <style></style>
    <div id="wrapper">
      <button id="reaction-button">
        <iconify-icon icon="lucide:smile"></iconify-icon>
      </button>
      <p id="count"></p>
    </div>
  </template>

`
  );

  customElements.define("reaction-component", ReactionComponent);
}

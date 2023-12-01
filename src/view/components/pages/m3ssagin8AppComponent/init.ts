import M3ssagin8AppComponent from ".";

function m3ssagin8AppComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <template id="m3ssagin8-app-template">
      <div id="app">
      </div>
    </template>
    `,
  );
  customElements.define("m3ssagin8-app-component", M3ssagin8AppComponent);
}

export default m3ssagin8AppComponentInit;

import M3ssagin8AppComponent from ".";

/**
 * Initialize the html template for the messageApp component and register it. 
 */
function m3ssagin8AppComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <template id="m3ssagin8-app-template">
      <section id="app">
        <chat-page></chat-page>
      </section>
    </template>
    `,
  );
  customElements.define("m3ssagin8-app-component", M3ssagin8AppComponent);
}

export default m3ssagin8AppComponentInit;

// Root component for the application.
// Handles routing to the correct page.
export default class M3ssagin8AppComponent extends HTMLElement {
  // Map of each URL hash to the component
  // that should be rendered when that hash is displayed
  routes: { [key: string]: string } = {
    "#/home": "<home-page></home-page>",
    "#/chat": "<chat-page></chat-page>",
  };

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    let template = document.querySelector("#m3ssagin8-app-template");

    if (!(template instanceof HTMLTemplateElement)) {
      throw Error("m3ssagin8app template was not found");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));
  }

  connectedCallback() {
    // When the URL changes,
    // change the page we are on.

    // needs to be a hash because there are no listeners for just a URL change for
    // some reason
    window.addEventListener("hashchange", (event: Event) => {
      // get the component of the page referred to by the hash
      let page_component = this.routes[window.location.hash];
      // If it doesn't exist, throw up a 404 error
      if (!page_component) {
        page_component = `<h2>404 not found</h2>`;
      }
      // Render the page referred to by the hash
      let app_element = this.shadowRoot?.querySelector("#app");
      if (app_element) {
        app_element.innerHTML = page_component;
      }
    });
  }
}

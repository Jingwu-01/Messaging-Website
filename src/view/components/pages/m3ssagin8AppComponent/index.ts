// Root component for the application.
// Handles routing to the correct page.
export default class M3ssagin8AppComponent extends HTMLElement {
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
    window.addEventListener("hashchange", (event: Event) => {
      let page_component = this.routes[window.location.hash];
      console.log(window.location.hash);
      if (!page_component) {
        page_component = `<h2>404 not found</h2>`;
      }
      console.log(page_component);
      let app_element = this.shadowRoot?.querySelector("#app");
      if (app_element) {
        app_element.innerHTML = page_component;
      }
    });
  }
}

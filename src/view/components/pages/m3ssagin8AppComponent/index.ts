// Root component for the application.

import ChatPageComponent from "../chatPage";
import HomePage from "../homePage";

// Handles routing to the correct page.
export default class M3ssagin8AppComponent extends HTMLElement {
  // Map of each URL hash to the component
  // that should be rendered when that hash is displayed

  private app_element: HTMLElement;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    let template = document.querySelector("#m3ssagin8-app-template");

    if (!(template instanceof HTMLTemplateElement)) {
      throw Error("m3ssagin8app template was not found");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));

    let app_element = this.shadowRoot?.querySelector("#app");

    if (!(app_element instanceof HTMLElement)) {
      throw Error("m3ssag1n8-app-component constructor: element with id app is not an HTMLElement");
    }
    
    this.app_element = app_element;
  }

  setHomePage() {
    let homePage = new HomePage();
    this.app_element.append(homePage);
  }

  setChatPage() {
    let chatPage = new ChatPageComponent();
    this.app_element.append(chatPage);
  }
}

/**
 * Root component for the application
 */
export default class M3ssagin8AppComponent extends HTMLElement {
  /**
   * Constructor for the MessagingAppComponent
   */
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    let template = document.querySelector("#m3ssagin8-app-template");

    if (!(template instanceof HTMLTemplateElement)) {
      throw Error("m3ssagin8app template was not found");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));
  }
}

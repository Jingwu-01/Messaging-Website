/**
 * the App Bar web Component is the bar at the top of the chatpage that contains the workspace menu and the user menu.
 */
export class AppBarComponent extends HTMLElement {
  /**
   * Constructor for the app bar component. 
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Set up the template. 
    let template = document.querySelector<HTMLTemplateElement>(
      "#app-bar-component-template",
    );
    if (!template) {
      throw Error("Could not find template #app-bar-component-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));
  }
}

export default AppBarComponent;

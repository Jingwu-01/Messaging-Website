/**
 * Defines the App Bar web Component.
 */
export class AppBarComponent extends HTMLElement {

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#app-bar-component-template",
    );
    if (!template) {
      throw Error("Could not find template #app-bar-component-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));
  }

  // TODO: This function does not work at all. 
  // connectedCallback(): void {
  //   if (this.appBarWrapper) {
  //     this.appBarWrapper.addEventListener('keypress', (e: KeyboardEvent): void => {
  //       const key: string | number = e.key || e.which || e.keyCode;
  //       if (key === 'Enter' || key === 13) {
  //           const activeElement: HTMLElement = document.activeElement as HTMLElement;
  //           slog.info("active element is: " + activeElement)
  //           activeElement.click();
  //       }
  //   }) 
  //   }
  // } 
}

export default AppBarComponent;

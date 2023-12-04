import { slog } from "../../../../../slog";

/**
 * Defines the App Bar web Component.
 */
export class AppBarComponent extends HTMLElement {
  private controller: AbortController | null = null;
  private appBarWrapper: HTMLElement; 

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

    let appBarWrapper = this.shadowRoot?.querySelector("#app-bar-wrapper")
    if (!(appBarWrapper instanceof HTMLElement)){
      throw Error("Could not find #app-bar-wrapper")
    }
    this.appBarWrapper = appBarWrapper
  }

  connectedCallback(): void {
    if (this.appBarWrapper) {
      this.appBarWrapper.addEventListener('keypress', (e: KeyboardEvent): void => {
        const key: string | number = e.key || e.which || e.keyCode;
        if (key === 'Enter' || key === 13) {
            const activeElement: HTMLElement = document.activeElement as HTMLElement;
            slog.info("active element is: " + activeElement)
            activeElement.click();
        }
    }) 
    }
   
  } 
}

export default AppBarComponent;

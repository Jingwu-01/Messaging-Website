import { getView } from "../../../view";

/**
 * The Loading Button component can disable itself or display the "loading..." text until it receives an event ID. Set the disabled-until-event attribute and pass it an event ID in order to disable the button. Set the loading-until-event attribute and pass it an event ID in order to make the button say "loading..." */
class LoadingButtonComponent extends HTMLElement {
  private loadingText: HTMLElement;
  private content: HTMLElement;
  private button: HTMLElement;

  /**
   * Construtor for the loading button.
   */
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#loading-button-component-template",
    );
    if (!template) {
      throw Error("Could not find template #hover-component-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));

    let loading_text_query = this.shadowRoot?.querySelector("#loading-text");
    if (!(loading_text_query instanceof HTMLElement)) {
      throw new Error("Could not find loading text");
    }
    this.loadingText = loading_text_query;

    let content_query = this.shadowRoot?.querySelector("#content");
    if (!(content_query instanceof HTMLElement)) {
      throw new Error("Could not find content");
    }
    this.content = content_query;

    let button_query = this.shadowRoot?.querySelector("#outer-button");
    if (!(button_query instanceof HTMLElement)) {
      throw new Error("Could not find loading button's #outer-button element");
    }
    this.button = button_query;
  }

  /**
   * The browser calls this when the element is removed from a document.
   */
  disconnectedCallback(): void {}

  /**
   * Observe the following attributes.
   */
  static get observedAttributes(): Array<string> {
    // Attributes to observe
    return ["disabled-until-event", "loading-until-event", "style"];
  }

  /**
   * When the attributes, disable and show loading text accordingly.
   */
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string,
  ): void {
    // Disable button
    if (name == "disabled-until-event") {
      this.button.setAttribute("disabled", "");
      getView().waitForEvent(newValue, () => {
        this.button.removeAttribute("disabled");
      });
    }
    // Add "Loading..." text
    else if (name == "loading-until-event") {
      this.button.setAttribute("disabled", "");
      this.content.setAttribute("hidden", "");
      this.loadingText.removeAttribute("hidden");
      getView().waitForEvent(newValue, () => {
        this.button.removeAttribute("disabled");
        this.loadingText.setAttribute("hidden", "");
        this.content.removeAttribute("hidden");
      });
    }
    // Pass button styles to child
    else if (name == "style") {
      this.button.setAttribute("style", newValue);
    }
  }
}

export default LoadingButtonComponent;

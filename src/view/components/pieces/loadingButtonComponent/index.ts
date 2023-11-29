import { EventWithId } from "../../../datatypes";
import { getView } from "../../../view";

// The Loading Button component can disable itself or display the "loading..."
// text until it receives an event ID.
// Set the disabled-until-event attribute and pass it an event ID in order to disable the button.
// Set the loading-until-event attribute and pass it an event ID in order to make the button say "loading..."
class LoadingButtonComponent extends HTMLElement {
  private loadingUntilEvent: string | null = null;
  private disabledUntilEvent: string | null = null;

  private loadingText: HTMLElement;
  private content: HTMLElement;
  private button: HTMLElement;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#loading-button-component-template"
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

  connectedCallback(): void {
    getView().addEventCompletedListener(this);
  }

  onEventCompleted(event: EventWithId, message?: string) {
    console.log("Detected event completed", event);
    // Remove "Loading..." text
    if (event.detail.id == this.loadingUntilEvent) {
      this.button.removeAttribute("disabled");
      this.loadingText.setAttribute("hidden", "");
      this.content.removeAttribute("hidden");
      this.loadingUntilEvent = null;
    }
    // Remove disabled button
    if (event.detail.id == this.disabledUntilEvent) {
      this.button.removeAttribute("disabled");
      this.disabledUntilEvent = null;
    }
  }

  disconnectedCallback(): void {
    // The browser calls this when the element is removed from a document.
  }
  static get observedAttributes(): Array<string> {
    // Attributes to observe
    return ["disabled-until-event", "loading-until-event"];
  }
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    // Disable button
    if (name == "disabled-until-event") {
      this.disabledUntilEvent = newValue;
      this.button.setAttribute("disabled", "");
    }
    // Add "Loading..." text
    if (name == "loading-until-event") {
      this.loadingUntilEvent = newValue;
      this.button.setAttribute("disabled", "");
      this.content.setAttribute("hidden", "");
      this.loadingText.removeAttribute("hidden");
    }
  }
}

export default LoadingButtonComponent;

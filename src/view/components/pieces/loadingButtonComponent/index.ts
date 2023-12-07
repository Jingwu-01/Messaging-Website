import { StateName } from "../../../datatypes";
import { getView } from "../../../view";

/**
 * The Loading Button component can disable itself if parts of the state are loading
 * or display the "loading..." text until it receives an event ID.
 * Set the loading-until-event attribute and pass it an event ID in order
 *  to make the button say "loading..." */
class LoadingButtonComponent extends HTMLElement {
  private loadingText: HTMLElement;
  private content: HTMLElement;
  private button: HTMLElement;

  /**
   * Pieces of state for which,
   * if they are loading,
   * the button should be disabled.
   */
  private disableIfStateLoading = new Set<StateName>();

  /**
   * Construtor for the loading button.
   */
  constructor() {
    super();

    this.attachShadow({ mode: "open", delegatesFocus: true });
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

  connectedCallback() {
    getView().addLoadingListener(this);
  }

  /**
   * Observe the following attributes.
   */
  static get observedAttributes(): Array<string> {
    // Attributes to observe
    return [
      "disable-if-state-loading",
      "loading-until-event",
      "style",
      "default-button-styles",
    ];
  }

  /**
   * When the attributes, disable and show loading text accordingly.
   */
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (name === "disable-if-state-loading") {
      this.disableIfStateLoading = new Set(
        newValue.split(" ")
      ) as Set<StateName>;
    }

    // Display loading spinner if we set the loading-until-event attribute
    if (name === "loading-until-event") {
      this.button.setAttribute("disabled", "");
      this.content.setAttribute("hidden", "");
      this.loadingText.removeAttribute("hidden");
      // When the event completes, stop displaying the loading spinner.
      getView().waitForEvent(newValue, () => {
        this.button.removeAttribute("disabled");
        this.loadingText.setAttribute("hidden", "");
        this.content.removeAttribute("hidden");
      });
    }

    // Pass button styles to child
    else if (name === "style") {
      this.button.setAttribute("style", newValue);
    }

    // Disable button styles
    else if (name === "default-button-styles") {
      if (newValue === "true") {
        this.button.classList.remove("loading-button");
      } else {
        this.button.classList.add("loading-button");
      }
    }
  }

  /**
   * View calls this when the piece of state is loading
   */
  onLoading(state: StateName) {
    // Disable button
    if (this.disableIfStateLoading.has(state)) {
      this.button.setAttribute("disabled", "");
    }
  }

  /**
   * View calls this when the piece of state finishes loading
   */
  onEndLoading(state: StateName) {
    // Un-disable button
    if (this.disableIfStateLoading.has(state)) {
      this.button.removeAttribute("disabled");
    }
  }
}

export default LoadingButtonComponent;

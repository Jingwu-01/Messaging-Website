/**
 * A Snackbar pops up at the bottom of the screen with a message and disappears when the "x" button is clicked. It is used for diaplaying error messages. 
 */
class SnackbarComponent extends HTMLElement {
  private wrapper: HTMLElement;
  private closeButton: HTMLElement;

  /**
   * Constructor for the snack bar custom element
   * */ 
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#snackbar-component-template",
    );
    if (!template) {
      throw Error("Could not find template #snackbar-component-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));

    let wrapper_query = this.shadowRoot?.querySelector("#wrapper");
    if (!(wrapper_query instanceof HTMLElement)) {
      throw new Error("Could not find element with id #wrapper");
    }
    this.wrapper = wrapper_query;

    let close_button_query = this.shadowRoot?.querySelector("#close-button");
    if (!(close_button_query instanceof HTMLElement)) {
      throw new Error("Could not find element with id close-button");
    }
    this.closeButton = close_button_query;
  }

  /**
   * When the component is connected, add event listeners for the wrapper and the close button. 
   */
  connectedCallback(): void {
    // Disable the animation when it's done.
    // This way, if the snackbarDisplay that this is rendered in changes,
    // the snackbar won't "fade-in" again.
    this.wrapper.addEventListener("animationend", () => {
      this.wrapper.style.animation = "none";
    });

    this.closeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.close();
    });
    // Auto-close snackbar after timeout
  }

  /**
   * Close the snack bar. 
   */
  close() {
    this.parentNode?.removeChild(this);
    this.remove();
  }
  
  /**
   * Observe the changes of level attribute. 
   */
  static get observedAttributes(): Array<string> {
    // Attributes to observe
    return ["level"];
  }

  /**
   * When the level attribute changes, display the corresponding snack bar.
   * @param name the name of the attibute that changes 
   * @param oldValue the old value of changed attribute
   * @param newValue the new value of chanegd attribute
   */
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string,
  ): void {
    // Display the snack bar in different colors based on the level of info. 
    if (name == "level") {
      switch (newValue) {
        case "error":
          this.wrapper.style.backgroundColor = "red";
          break;
        case "warn":
          this.wrapper.style.backgroundColor = "yellow";
          break;
        case "info":
          this.wrapper.style.backgroundColor = "#ADD8E6";
          break;
      }
    }
  }
}

export default SnackbarComponent;

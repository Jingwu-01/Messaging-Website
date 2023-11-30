import { slog } from "../../../../slog";

class HomePage extends HTMLElement {
  private controller: AbortController | null = null;
  private dialog: HTMLDialogElement | null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    if (this.shadowRoot) {
      let template = document?.querySelector("#home-page-template");
      if (!(template instanceof HTMLTemplateElement)) {
        throw new Error("#home-page-template is not an HTML template element");
      } else {
        this.shadowRoot.append(template.content.cloneNode(true));
      }
    }

    let dialog = this.shadowRoot?.querySelector("#login-dialog");
    if (!(dialog instanceof HTMLDialogElement)) {
      throw Error("#login dialog is not a HTMLDialog element");
    }
    this.dialog = dialog;

    this.dialog?.addEventListener("keydown", this.keyDown.bind(this));
  }

  connectedCallback(): void {
    // Show the login modal dialog
    this.dialog?.showModal();

    this.controller = new AbortController();
    const options = { signal: this.controller.signal };

    const form = this.shadowRoot?.querySelector("#username-form");
    if (!(form instanceof HTMLFormElement)) {
      throw new Error("form not found");
    }
    form.addEventListener("submit", this.handleSubmit.bind(this), options);
  }

  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }

  /* Retrieves the username input from modal dialog box and dispatches login custom event to adapter. */
  private handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const usernameInput = this.shadowRoot?.querySelector("#username-input");
    if (usernameInput instanceof HTMLInputElement) {
      const username = usernameInput.value;
      const loginEvent = new CustomEvent("loginEvent", {
        detail: { username: username },
      });
      slog.info(`User submitted login ${username}`);
      document.dispatchEvent(loginEvent);
      this.dialog?.close();
    } else {
      throw new Error(
        "Element with id #username-input is not a HTMLInputElement"
      );
    }
  }

  /* Deals with keyboard events, including esc and enter. */ 
  private keyDown(event: KeyboardEvent) {
    // Prevents the default action of closing the dialog by ESC.
    if (event.key === "Escape") {
      event.preventDefault();
    }

    // When enter is hit, submit the login request. 
    if (event.key === "Enter" && this.dialog?.open) {
      this.handleSubmit.bind(this);
    }
  }
}

export default HomePage;

import { slog } from "../../../../slog";

class HomePage extends HTMLElement {
  private controller: AbortController | null = null;
  private dialog: HTMLDialogElement; 

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    if (this.shadowRoot) {
      let template = document.querySelector("#home-page-template");
      if (!(template instanceof HTMLTemplateElement)) {
        throw new Error("Login template is not HTML template element");
      } else {
        this.shadowRoot.append(template.content.cloneNode(true));
      }
    }

    let dialog = this.shadowRoot?.querySelector("dialog");
    if (!(dialog instanceof HTMLDialogElement)) {
      throw Error("Could not find a dialog element");
    }
    this.dialog = dialog; 
  }

  connectedCallback(): void {
    this.dialog.showModal();

    const form = this.shadowRoot?.querySelector("#username-form");
    if (!(form instanceof HTMLFormElement)) {
      throw new Error("form not found");
    }
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    form.addEventListener("submit", this.handleSubmit.bind(this), options);
  }

  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }

  handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const usernameInput = this.shadowRoot?.querySelector("#username-input");
    if (usernameInput instanceof HTMLInputElement) {
      const username = usernameInput.value;
      const loginEvent = new CustomEvent("loginEvent", {
        detail: { username: username },
      });
      slog.info(`User submitted login ${username}`);
      document.dispatchEvent(loginEvent);
      this.dialog.close(); 
    } else {
      throw new Error(
        "Element with id #username-input is not a HTMLInputElement"
      );
    }
  }
}

export default HomePage;

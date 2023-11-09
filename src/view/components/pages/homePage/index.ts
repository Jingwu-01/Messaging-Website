export type LoginEvent = {
  username: string;
};

class LoginPage extends HTMLElement {
  private controller: AbortController | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    if (this.shadowRoot) {
      let template = document.querySelector("#login-template");
      if (!(template instanceof HTMLTemplateElement)) {
        throw new Error("Login template is not HTML template element");
      } else {
        this.shadowRoot.append(template.content.cloneNode(true));
      }
    }
  }

  connectedCallback(): void {
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
    const usernameInput = document.querySelector("#username-input");
    if (usernameInput instanceof HTMLInputElement) {
      const username = usernameInput.value;
      const loginEvent = new CustomEvent("loginEvent", {
        detail: { username: username },
      });
      document.dispatchEvent(loginEvent);
    } else {
      throw new Error("No username submitted");
    }
  }
}

customElements.define("login-page", LoginPage);

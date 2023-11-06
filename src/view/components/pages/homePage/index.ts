class LoginPage extends HTMLElement {
  private controller: AbortController | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    if (this.shadowRoot) {
      let template = document.querySelector("#counter-template");
      if (!(template instanceof HTMLTemplateElement)) {
        throw new Error("login page")
      } else {
      this.shadowRoot.append(template.content.cloneNode(true));} 
    } 
  } 

  connectedCallback(): void {
    const form = this.shadowRoot?.querySelector("#username-box");
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
    const username = usernameInput.value;
}
} 
customElements.define("login-page", LoginPage);

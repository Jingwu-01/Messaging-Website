class LoginPage extends HTMLElement {
  private controller: AbortController | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    if (this.shadowRoot) {
      // This could also come from an HTML template
      this.shadowRoot.innerHTML = `
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
  <style>
    * {
      background-color: #add8e6;
      text-align: center;
    }
    div {
      background-color: #ffffff;
    }
    div p {
      background-color: #ffffff;
    }

    div form {
      background-color: #ffffff;
    }
    button {
      background-color: #ffffff;
    }
    button iconify-icon {
      background-color: #ffffff;
    }
    input {
      background-color: #d9d9d9;
      border: 1px solid #333;
    }
  </style>
  <h1>Messaging</h1>
  <p>A Messaging App for All Your Groups</p>
  <div>
    <p>Enter your username to login:</p>
    <form id="username-box">
      <input type="text" id="text_field" name="text_field" />
      <button type="submit">
        <iconify-icon
          icon="ic:baseline-login"
          id="username-submit"
        ></iconify-icon>
      </button>
    </form>
  </div>
        `;
    } else {
      throw new Error("shadowRoot does not exist");
    }
  }

  connectedCallback(): void {
    const form = this.shadowRoot?.querySelector("#username-box");
    if (!(form instanceof HTMLFormElement)) {
      throw new Error("form not found");
    }
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    form.addEventListener("sumbit", this.handleSubmit.bind(this), options);
  }

  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }

  handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const username = usernameInput.value;

    
}

customElements.define("login-page", LoginPage);

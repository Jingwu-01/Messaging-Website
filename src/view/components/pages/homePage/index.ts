import { slog } from "../../../../slog";
import { getView } from "../../../view";

class HomePage extends HTMLElement {
  private controller: AbortController | null = null;
  private dialog: HTMLDialogElement;
  private form: HTMLFormElement;
  private submitButton: HTMLElement;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    if (this.shadowRoot) {
      let template = document.querySelector("#home-page-template");
      if (!(template instanceof HTMLTemplateElement)) {
        throw new Error("home-page-template is not an HTML template element");
      } else {
        this.shadowRoot.append(template.content.cloneNode(true));
      }
    }

    let dialog = this.shadowRoot?.querySelector("dialog");
    if (!(dialog instanceof HTMLDialogElement)) {
      throw Error("Could not find a dialog element");
    }
    this.dialog = dialog;

    let form = this.shadowRoot?.querySelector("#username-form");
    if (!(form instanceof HTMLFormElement)) {
      throw new Error("form not found");
    }
    this.form = form;

    let submit_button = this.shadowRoot?.querySelector("#submit-button");
    if (!(submit_button instanceof HTMLElement)) {
      throw new Error("button not found");
    }
    this.submitButton = submit_button;

    // These allow snackbars to render when this dialog is open.
    this.addEventListener = this.dialog.addEventListener;
    this.appendChild = this.dialog.appendChild;
  }

  connectedCallback(): void {
    this.dialog.showModal();

    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    this.form.addEventListener("submit", this.handleSubmit.bind(this), options);
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
      // Create and send off event to adapter
      const event_id = String(Date.now());
      const loginEvent = new CustomEvent("loginEvent", {
        detail: { username: username, id: event_id },
      });
      slog.info(`User submitted login ${username}`);
      document.dispatchEvent(loginEvent);
      // Disable the form while we wait to log in.
      this.submitButton.setAttribute("disabled", "");
      // When login is successful, re-enable the form and close this dialog.
      getView().waitForEvent(event_id, () => {
        this.dialog.close();
        this.submitButton.removeAttribute("disabled");
      });
    } else {
      throw new Error(
        "Element with id #username-input is not a HTMLInputElement"
      );
    }
  }
}

export default HomePage;

import { slog } from "../../../../slog";
import { ViewUser } from "../../../datatypes";
import { getView } from "../../../view";

/**
 * HomePage is a dialog that propts the user to log in.
 */
class HomePage extends HTMLElement {
  /** controller */
  private controller: AbortController | null = null;
  /** login dialog element */
  private dialog: HTMLDialogElement;
  /** login form element */
  private form: HTMLFormElement;
  /** submit button for login */
  private submitButton: HTMLElement;

  /**
   * Constructor for the HomePage component.
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Set up the template and clone it.
    if (this.shadowRoot) {
      let template = document?.querySelector("#home-page-template");
      if (!(template instanceof HTMLTemplateElement)) {
        throw new Error("#home-page-template is not an HTML template element");
      } else {
        this.shadowRoot.append(template.content.cloneNode(true));
      }
    }

    // Set up the login dialog
    let dialog = this.shadowRoot?.querySelector("#login-dialog");
    if (!(dialog instanceof HTMLDialogElement)) {
      throw Error("#login dialog is not a HTMLDialog element");
    }
    this.dialog = dialog;

    // Set up the login form
    let form = this.shadowRoot?.querySelector("#username-form");
    if (!(form instanceof HTMLFormElement)) {
      throw new Error("form not found");
    }
    this.form = form;

    // Set up the submit button
    let submit_button = this.shadowRoot?.querySelector("#submit-button");
    if (!(submit_button instanceof HTMLElement)) {
      throw new Error("button not found");
    }
    this.submitButton = submit_button;

    // These allow snackbars to render when this dialog is open.
    this.addEventListener = this.dialog.addEventListener.bind(this.dialog);
    this.appendChild = this.dialog.appendChild.bind(this.dialog);
  }

  /**
   * When connected, add userlistner. Also, add event listeners for sumbit and keyboard events.
   */
  connectedCallback(): void {
    // Add user listener.
    getView().addUserListener(this);

    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    // Add submit event listener for form.
    this.form.addEventListener("submit", this.handleSubmit.bind(this), options);

    // Add keyboard event listener for the dialog.
    this.dialog?.addEventListener("keydown", this.keyDown.bind(this));
  }

  /**
   * When disconnected, remove the controller.
   */
  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }

  /**
   * Retrieves the username input from modal dialog box and dispatches login custom event to adapter.
   */
  private handleSubmit(event: SubmitEvent) {
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
      getView().waitForEvent(event_id, (event, error) => {
        this.submitButton.removeAttribute("disabled");
      });
    } else {
      throw new Error(
        "Element with id #username-input is not a HTMLInputElement",
      );
    }
  }

  /**
   * Deals with keyboard events, including esc and enter.
   */
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

  /**
   * Show the dialog.
   */
  showModal() {
    this.dialog.showModal();
  }

  /**
   * Close the dialog.
   */
  close() {
    this.dialog.close();
  }

  /**
   * Based on the cuurent user, display the Login Dialog again or close the dialog.
   */
  displayUser(user: ViewUser | null) {
    if (user == null) {
      getView().openDialog("login-dialog");
    } else {
      this.dialog.close();
    }
  }
}

export default HomePage;

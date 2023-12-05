import { ViewUser } from "../../../../../datatypes";
import { getView } from "../../../../../view";

/**
 * Displays username, handles logout
 */
class UserMenuComponent extends HTMLElement {
  private controller: AbortController | null = null;

  private menu: HTMLElement;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#user-menu-component-template"
    );
    if (!template) {
      throw Error("Could not find template #user-menu-component-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));

    let menu = this.shadowRoot?.querySelector<HTMLElement>("#menu");
    if (!menu) {
      throw Error("Could not find element with id #menu");
    }
    this.menu = menu;
  }

  /**
   * When UserMenuComponent is added to a document, this is called.
   */
  connectedCallback(): void {
    // Tell the view that this component wants to listen to user updates
    getView().addUserListener(this);

    // Add logout listener to logout button
    const logoutButton = this.shadowRoot?.querySelector("#logout-button");
    if (!(logoutButton instanceof HTMLElement)) {
      throw new Error("Logout not HTMLElement");
    }
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    logoutButton.addEventListener(
      "click",
      this.handleLogout.bind(this),
      options
    );
  }

  /**
   * Handles the logout request by sending a logout event.
   */
  handleLogout(event: MouseEvent) {
    event.preventDefault();
    const logoutEvent = new CustomEvent("logoutEvent", {
      detail: { id: new String(Date.now()) },
    });
    document.dispatchEvent(logoutEvent);
  }

  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }

  static get observedAttributes(): Array<string> {
    // Attributes to observe
    return [];
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {}

  // called by view whenever there is a change in the logged-in user
  displayUser(user: ViewUser | null) {
    // update the displayed username
    let user_text_el = this.shadowRoot?.querySelector("#user-text");
    if (user_text_el instanceof HTMLElement) {
      user_text_el.innerHTML = user?.username ?? "";
    }
  }
}

export default UserMenuComponent;

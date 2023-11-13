import { ViewUser } from "../../../../../datatypes";
import { getView } from "../../../../../view";

// Displays username, handles logout.
class UserMenuComponent extends HTMLElement {
  private controller: AbortController | null = null;

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
  }

  connectedCallback(): void {
    // The browser calls this when the element is added to a document.

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

  handleLogout(event: Event) {
    event.preventDefault();
    const logoutEvent = new CustomEvent("logoutEvent", {
      detail: {},
    });
    document.dispatchEvent(logoutEvent);
  }

  disconnectedCallback(): void {
    // The browser calls this when the element is removed from a document.
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
  displayUser(user: ViewUser) {
    // update the displayed username
    let user_text_el = this.shadowRoot?.querySelector("#user-text");
    if (user_text_el instanceof HTMLElement) {
      user_text_el.innerHTML = user.username;
    }
  }
  // render() {
  //   let user = getUser()
  //   // update the displayed username
  //   let user_text_el = this.shadowRoot?.querySelector("#user-text");
  //   if (user_text_el instanceof HTMLElement) {
  //     user_text_el.innerHTML = user.username;
  //   }
  // }
}

export default UserMenuComponent;

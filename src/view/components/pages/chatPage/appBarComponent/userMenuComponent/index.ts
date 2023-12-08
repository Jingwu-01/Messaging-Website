import { slog } from "../../../../../../slog";
import {
  ViewChannel,
  ViewChannelUpdate,
  ViewUser,
} from "../../../../../datatypes";
import { getView } from "../../../../../view";

/**
 * UserMenu Component displays username, has my starred posts button and
 * handles logout.
 */
class UserMenuComponent extends HTMLElement {
  /** Controller */
  private controller: AbortController | null = null;
  /** the starred posts button  */
  private starredPostsButton: HTMLElement;
  /** logout button */
  private logoutButton: HTMLElement | null;

  /**
   * Constructor for the UserMenu Component.
   */
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

    const starredPostsButton = this.shadowRoot?.querySelector(
      "#my-starred-posts-button"
    );
    if (!(starredPostsButton instanceof HTMLElement)) {
      throw Error("cannot find #my-starred-posts-button HTMLElement");
    } else {
      this.starredPostsButton = starredPostsButton;
    }

    const logoutButton = this.shadowRoot?.querySelector("#logout-button");
    if (!(logoutButton instanceof HTMLElement)) {
      throw Error("cannot find #logout-button HTMLElement");
    } else {
      this.logoutButton = logoutButton;
    }
  }

  /**
   * When UserMenuComponent is added to a document, this is called.
   */
  connectedCallback(): void {
    // Tell the view that this component wants to listen to user updates
    this.starredPostsButton.style.display = "none";
    getView().addUserListener(this);
    getView().addPostDisplayListener(this);

    this.controller = new AbortController();
    const options = { signal: this.controller.signal };

    // Add logout listener to logout button
    this.logoutButton?.addEventListener(
      "click",
      this.handleLogout.bind(this),
      options
    );

    // Add starredPosts listener to starredPostsButton
    this.starredPostsButton?.addEventListener(
      "click",
      this.handleStarredPosts.bind(this),
      options
    );
  }

  /**
   * When disconnected, abort the controller.
   */
  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
    getView().removePostDisplayListener(this);
  }

  /**
   * Handles the logout request by sending a logout event.
   * @param event Mousevent of clicking
   */
  handleLogout(event: MouseEvent) {
    event.preventDefault();
    const logoutEvent = new CustomEvent("logoutEvent", {
      detail: { id: new String(Date.now()) },
    });
    document.dispatchEvent(logoutEvent);
  }

  /**
   * Handles the show starred posts by ask the view to get the starred posts component and display the dialog.
   * @param event Mousevent of clicking
   */
  handleStarredPosts(event: MouseEvent) {
    event.preventDefault();
    getView().openDialog("starred-posts-dialog");
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

  /**
   * called by view whenever there is a change in the logged-in user
   * @param user a VierUser that contains username or null
   */
  displayUser(user: ViewUser | null) {
    // update the displayed username
    let user_text_el = this.shadowRoot?.querySelector("#user-text");
    if (user_text_el instanceof HTMLElement) {
      user_text_el.innerHTML = user?.username ?? "";
    }
  }

  displayPostDisplay() {
    this.starredPostsButton.style.display = "block";
  }

  removePostDisplay() {
    this.starredPostsButton.style.display = "none";
  }
}

export default UserMenuComponent;

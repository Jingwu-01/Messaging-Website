import { slog } from "../../../../slog";
import { ReactionUpdateEvent, StateName } from "../../../datatypes";
import { getView } from "../../../view";

/**
 * StarButtonComponent is used for starring posts. When a user clicks on it, they can star or de-star a post and view starred posts later in my starred posts section.
 */
class StarButtonComponent extends HTMLElement {
  /** controller */
  private controller: AbortController | null = null;

  /** star button */
  private starButton: HTMLButtonElement;

  private starIcon: HTMLElement;

  /** parent post path */
  private parentPath: string | undefined;

  /** logged in username */
  private loggedInUser: string | undefined;

  /**
   * Constructor for startButton component.
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    let template = document.querySelector("#star-button-component-template");

    if (!(template instanceof HTMLTemplateElement)) {
      throw new Error(
        "StarButtonComponent: could not find an element with the id star-button-component-template"
      );
    }

    if (this.shadowRoot === null) {
      throw new Error("StarButtonComponent: no shadow root exists");
    }

    this.shadowRoot.append(template.content.cloneNode(true));

    const starButton = this.shadowRoot.querySelector("#star-button");
    if (!(starButton instanceof HTMLButtonElement)) {
      throw new Error(
        "StarButtonComponent: could not find an element with the #star-button id"
      );
    }

    this.starButton = starButton;

    const starIcon = this.shadowRoot.querySelector("#star-icon");
    if (!(starIcon instanceof HTMLButtonElement)) {
      throw new Error(
        "StarButtonComponent: could not find an element with the #star-icon id"
      );
    }

    this.starIcon = starIcon;

    this.starButton = starButton;

    getView().addLoadingListener(this);
  }

  /**
   * When the component is connected, add click event listener for the star button.
   */
  connectedCallback(): void {
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    this.starButton.addEventListener(
      "click",
      this.updateStarred.bind(this),
      options
    );
  }

  /**
   * When the component is disconnected, abort the controller.
   */
  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }

  /**
   * Dispatch a update starred posts event to the adapter, which contains username, post path, the state of the star button.
   * @returns
   */
  updateStarred() {
    let user = this.loggedInUser;
    let postPath = this.parentPath;
    let curReacted: boolean;
    // If postPath or loggedin user is undefine, slog an error.
    if (postPath === undefined || user === undefined) {
      getView().displayError("tried to star a malformed post");
      slog.error(
        "StarButtonComponent: updateStarred, user or postPath is undefined",
        ["user", user],
        ["postPath", postPath]
      );
      return;
    }
    // Check if the current post is starred.
    if (this.starButton.classList.contains("reacted")) {
      curReacted = true;
    } else {
      curReacted = false;
    }

    const event_id = String(Date.now());
    // Dispatch the update star posts event.
    let starEventContent: ReactionUpdateEvent = {
      userName: user,
      postPath: postPath,
      add: !curReacted,
      reactionName: undefined,
      id: event_id,
    };
    slog.info("StarButtonComponet: updateStarred", [
      "starEventContent",
      starEventContent,
    ]);
    const starUpdateEvent = new CustomEvent("reactionUpdateEvent", {
      detail: starEventContent,
    });
    this.starIcon.setAttribute("icon", "svg-spinners:180-ring-with-bg");
    this.starIcon.setAttribute("disabled", "");
    getView().waitForEvent(event_id, () => {
      this.starIcon.setAttribute("icon", "material-symbols:star-outline");
      this.starIcon.removeAttribute("disabled");
    });
    document.dispatchEvent(starUpdateEvent);
  }

  /**
   * Observe the attribute icon and reacted.
   */
  static get observedAttributes(): string[] {
    return ["icon", "reacted"];
  }

  /**
   * When the observed attributes are changed, adjust state of the starred post accordingling.
   * @param name name of attribute that are changed
   * @param oldValue the old value of the changed attribute
   * @param newValue the new value of the changed attribute
   */
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "reacted") {
      // TODO: compare to old values and stuff
      if (newValue === "true") {
        this.starButton.classList.add("reacted");
      } else {
        this.starButton.classList.remove("reacted");
      }
    }
  }

  /**
   * Set the parent path of this starButtonComponent to the input string
   * @param parentPath a string of parent path.
   */
  setParentPath(parentPath: string) {
    this.parentPath = parentPath;
  }

  /**
   * Set the username of this starButtonComponent to the input string.
   * @param username a string of username.
   */
  setLoggedInUser(username: string) {
    this.loggedInUser = username;
  }

  /**
   * Called by the view when a piece of the state starts loading.
   * @param state The piece of the state that is loading.
   */
  onLoading(state: StateName) {
    if (state === "channels" || state === "user" || state === "workspaces") {
      this.starButton.setAttribute("disabled", "");
    }
  }

  /**
   * Called by the view when a piece of the state is finished loading.
   * @param state The piece of the state that is finished loading.
   */
  onEndLoading(state: StateName) {
    if (state === "channels" || state === "user" || state === "workspaces") {
      this.starButton.removeAttribute("disabled");
    }
  }
}

export default StarButtonComponent;

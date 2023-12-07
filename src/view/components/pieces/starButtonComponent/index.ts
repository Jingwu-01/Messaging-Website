import { slog } from "../../../../slog";
import { ReactionUpdateEvent } from "../../../datatypes";
import { getView } from "../../../view";

/**
 * StarButtonComponent is used for starring posts. When a user clicks on it, they can star or de-star a post and view starred posts later in my starred posts section.
 */
class StarButtonComponent extends HTMLElement {
  private controller: AbortController | null = null;

  private starIcon: HTMLElement;

  private starButton: HTMLButtonElement;

  private parentPath: string | undefined;

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

    const starIcon = this.shadowRoot.querySelector("#star-icon");
    if (!(starIcon instanceof HTMLElement)) {
      throw new Error(
        "StarButtonComponent: could not find an element with the #star-icon id"
      );
    }

    const starButton = this.shadowRoot.querySelector("#star-button");
    if (!(starButton instanceof HTMLButtonElement)) {
      throw new Error(
        "StarButtonComponent: could not find an element with the #star-button id"
      );
    }

    this.starIcon = starIcon;
    this.starButton = starButton;
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

    // Dispatch the update star posts event.
    let starEventContent: ReactionUpdateEvent = {
      userName: user,
      postPath: postPath,
      add: !curReacted,
      reactionName: undefined,
    };
    slog.info("StarButtonComponet: updateStarred", [
      "starEventContent",
      starEventContent,
    ]);
    const starUpdateEvent = new CustomEvent("reactionUpdateEvent", {
      detail: starEventContent,
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
}

export default StarButtonComponent;

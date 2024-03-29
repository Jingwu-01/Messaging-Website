import { slog } from "../../../../slog";
import { ReactionUpdateEvent, StateName } from "../../../datatypes";
import escapeString from "../../../utils";
import { getView } from "../../../view";

/** Reactions can only one of the four defined reactions types. */
export type reactions = "smile" | "frown" | "like" | "celebrate";

/** ReactionComponent is reaction buttons for posts. When a user clicks on it, a
 * reaction will be added or removed.
 */
class ReactionComponent extends HTMLElement {
  /** Controller */
  private controller: AbortController | null = null;
  /** Reaction icon element */
  private reactionIcon: HTMLElement;
  /** Reaction button */
  private reactionButton: HTMLElement;
  /** name of the reaction */
  private reactionName: reactions = "smile";
  /** the number of reactions received of this type */
  private count: number = 0;
  /** parent post path */
  private parentPath: string | undefined;
  /** logged in username */
  private loggedInUser: string | undefined;

  /**
   * Constructor for the ReactionComponent.
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    let template = document.querySelector("#reaction-component-template");
    if (!(template instanceof HTMLTemplateElement)) {
      throw new Error("ReactionComponent: template was not found");
    }

    if (this.shadowRoot === null) {
      throw new Error("ReactionComponent: no shadow root exists");
    }

    this.shadowRoot.append(template.content.cloneNode(true));

    const reactionButton = this.shadowRoot?.querySelector("#reaction-button");
    if (!(reactionButton instanceof HTMLElement)) {
      throw new Error("reactionButton not HTML button element");
    }

    const reactionIcon = this.shadowRoot?.querySelector("#smile-reaction");
    if (!(reactionIcon instanceof HTMLElement)) {
      throw new Error("smileButton is not an HTMLElement");
    }

    this.reactionIcon = reactionIcon;
    this.reactionButton = reactionButton;
  }

  /**
   * When the ReactionComponent is connected, add a click listener for the reaction button.
   */
  connectedCallback(): void {
    // Set the count for the reaction.
    this.setCount(this.count);

    // Add click event listener for the reactionButton. If clicked, call the this.update() function.
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    this.reactionButton.addEventListener(
      "click",
      this.update.bind(this),
      options,
    );

    getView().addLoadingListener(this);
  }

  /**
   * When the ReactionComponent is disconnected, remove the controller.
   */
  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }

  /**
   * Dispatch an reaction update event to the adapter.
   */
  update(): void {
    let user = this.loggedInUser;
    let postPath = this.parentPath;
    let curReacted: boolean;

    // If postPath or loggedin user is undefine, slog an error.
    if (postPath === undefined || user === undefined) {
      getView().displayError("reacted to a malformed post");
      slog.error(
        "ReactionComponent: update, user or postPath is undefined",
        ["user", user],
        ["postPath", postPath],
      );
      return;
    }
    if (this.reactionButton.classList.contains("reacted")) {
      curReacted = true;
    } else {
      curReacted = false;
    }
    const event_id = String(Date.now());
    // Dispatch the reactionUpdate event, which contains the reaction name, username, post path, and new state of the reaction.
    let updateEventContent: ReactionUpdateEvent = {
      reactionName: `${this.reactionName}`,
      userName: user,
      postPath: postPath,
      add: !curReacted,
      id: event_id,
    };
    slog.info("ReactionComponent: update", [
      "updateEventContent",
      updateEventContent,
    ]);
    const reactionUpdateEvent = new CustomEvent("reactionUpdateEvent", {
      detail: updateEventContent,
    });
    this.reactionButton.setAttribute("disabled", "");
    const oldIcon = this.reactionIcon.getAttribute("icon");
    if (!oldIcon) {
      throw new Error("iconify-icon component has no icon attribute");
    }
    this.reactionIcon.setAttribute("icon", "svg-spinners:180-ring-with-bg");
    getView().waitForEvent(event_id, (evt, err) => {
      this.reactionIcon.setAttribute("icon", oldIcon);
      this.reactionButton.removeAttribute("disabled");
    });
    document.dispatchEvent(reactionUpdateEvent);
  }

  /**
   * Set the count of a particular reaction
   * @param count the number of a particular reaction that the post receives.
   */
  setCount(count: number): void {
    const countText = this.shadowRoot?.querySelector("#reaction-count");
    if (!(countText instanceof HTMLParagraphElement)) {
      throw new Error("countText is not an HTML paragraph element");
    } else {
      // Set the innerHTML of countText to the input count string.
      countText.innerHTML = escapeString(count.toString());
      slog.info("addReactionCount: set count", [
        "countText.innerHTML",
        countText.innerHTML,
      ]);
    }
    slog.info("addReactionCount: after setting count", [
      "countText",
      countText,
    ]);
  }

  /**
   * Observe the attribute icon, reaction-button, and reacted.
   */
  static get observedAttributes(): string[] {
    return ["icon", "reaction-count", "reacted"];
  }

  /**
   * When the observed attributes are changed, adjust arial-labels and display the correct iconify icons.
   * @param name name of attribute that are changed
   * @param oldValue the old value of the changed attribute
   * @param newValue the new value of the changed attribute
   */
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // If the icon attribute is changed, update the corresponding arial-labels and reactionName.
    if (name === "icon") {
      if (newValue === "lucide:frown") {
        this.reactionButton.setAttribute("aria-label", "frown reaction");
        this.reactionName = "frown";
      } else if (newValue === "mdi:like-outline") {
        this.reactionButton.setAttribute("aria-label", "like reaction");
        this.reactionName = "like";
      } else if (newValue === "mingcute:celebrate-line") {
        this.reactionButton.setAttribute("aria-label", "celebrate reaction");
        this.reactionName = "celebrate";
      } else if (newValue === "lucide:smile") {
        this.reactionButton.setAttribute("aria-label", "smile reaction");
        this.reactionName = "smile";
      } else {
        slog.info("ReactionComponent: attributeChangedCallback", [
          "unsupportedReaction",
          "",
        ]);
      }
      // Update the icon attribute to the newValue so that the appropriate iconify icons could be displayed.
      this.reactionIcon.setAttribute("icon", newValue);
    } else if (name === "reaction-count") {
      // If the count of reactions are changed, update and display the count.
      slog.info("attributeChangedCallback: reaction-count");
      let numReactionCount = parseInt(newValue);
      this.count = numReactionCount;
      this.setCount(numReactionCount);
    } else if (name === "reacted") {
      if (newValue === "true") {
        this.reactionButton.classList.add("reacted");
      } else {
        this.reactionButton.classList.remove("reacted");
      }
    }
  }

  /**
   * Set the parentPath of this ReactionComponent to the input string.
   * @param parentPath the input string for new parentPath
   */
  setParentPath(parentPath: string) {
    this.parentPath = parentPath;
  }

  /**
   * Set the loggedInUser of this ReactionComponent to intput username string.
   * @param username the input string for the new username
   */
  setLoggedInUser(username: string) {
    this.loggedInUser = username;
  }

  onLoading(state: StateName) {
    if (state === "user") {
      this.reactionButton.setAttribute("disabled", "");
    }
  }

  onEndLoading(state: StateName) {
    if (state === "user") {
      this.reactionButton.removeAttribute("disabled");
    }
  }
}

export default ReactionComponent;

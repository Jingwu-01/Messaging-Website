import { slog } from "../../../../slog";
import { getView } from "../../../view";
import PostDisplay from "./postDisplayComponent";

/**
 * Component that displays the page where chats are displayed.
 */
export class ChatPageComponent extends HTMLElement {
  private mainContainer: HTMLElement;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#chat-page-template",
    );
    if (!template) {
      throw Error("Could not find template #chat-page-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));

    let mainContainer = this.shadowRoot?.querySelector("main");

    if (!(mainContainer instanceof HTMLElement)) {
      throw new Error("mainContainer is not an HTML element");
    }

    this.mainContainer = mainContainer;
  }

  /**
   * When connencted, add Post Display listeners.
   */
  connectedCallback() {
    slog.info("ChatPageComponent: connectedCallback was called");
    getView().addPostDisplayListener(this);
  }

  /**
   * When disconnected, remove the Post Display listeners.
   */
  disconnectedCallback() {
    slog.info("ChatPageComponent: disconnectedCallback was called");
    getView().removePostDisplayListener(this);
  }

  /**
   * Display the Post Display.
   */
  displayPostDisplay() {
    // remove existing one's (in case of multiple) in case of errors, and add a new one.
    this.removePostDisplay();
    let newPostDisplay = new PostDisplay();
    this.mainContainer.append(newPostDisplay);
  }

  /**
   * Remove the post Display.
   */
  removePostDisplay() {
    let currentPostDisplay = this.mainContainer.querySelectorAll(
      "post-display-component",
    );
    for (let potentialPostDisplay of currentPostDisplay) {
      if (potentialPostDisplay instanceof PostDisplay) {
        potentialPostDisplay.remove();
        slog.info(
          "ChatPageComponent: removePostDisplay, removed current post display",
          ["potentialPostDisplay", potentialPostDisplay],
        );
      }
    }
  }
}

export default ChatPageComponent;

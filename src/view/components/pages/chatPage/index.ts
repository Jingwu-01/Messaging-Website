import { slog } from "../../../../slog";
import { getView } from "../../../view";
import PostDisplay from "./postDisplayComponent";

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

  connectedCallback() {
    slog.info("ChatPageComponent: connectedCallback was called");
    getView().addPostDisplayListener(this);
  }

  disconnectedCallback() {
    slog.info("ChatPageComponent: disconnectedCallback was called");
    getView().removePostDisplayListener(this);
  }

  displayPostDisplay() {
    // remove existing one's (in case of multiple) in case of errors, and add a new one.
    this.removePostDisplay();
    let newPostDisplay = new PostDisplay();
    this.mainContainer.append(newPostDisplay);
  }

  removePostDisplay() {
    let currentPostDisplay = this.mainContainer.querySelectorAll("post-display-component");
    for (let potentialPostDisplay of currentPostDisplay) {
      if (potentialPostDisplay instanceof PostDisplay) {
        potentialPostDisplay.remove();
        slog.info("ChatPageComponent: removePostDisplay, removed current post display", ["potentialPostDisplay", potentialPostDisplay]);
      }
    }
  }
}

export default ChatPageComponent;

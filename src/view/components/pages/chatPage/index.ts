import { slog } from "../../../../slog";
import { getView } from "../../../view";
import PostDisplay from "./postDisplayComponent";
import StarredPosts from "./starredPostsComponent";

/**
 * ChatPage Component displays the page where chats(workspaces, channels, and posts) are displayed.
 */
export class ChatPageComponent extends HTMLElement {
  /** Container for the whole chatpage */
  private mainContainer: HTMLElement;

  /**
   * Constructor for the ChatPage component.
   */
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
    getView().addStarredPostsListener(this);
  }

  /**
   * When disconnected, remove the Post Display listeners.
   */
  disconnectedCallback() {
    slog.info("ChatPageComponent: disconnectedCallback was called");
    getView().removePostDisplayListener(this);
    getView().removeStarredPostsListener(this);
  }

  /**
   * Display the Post Display.
   */
  displayPostDisplay() {
    // remove existing one's (in case of multiple) in case of errors, and add a new one.
    this.removePostDisplay();
    let newPostDisplay = new PostDisplay();
    let newStarredPosts = new StarredPosts();
    this.mainContainer.append(newPostDisplay);
    this.mainContainer.append(newStarredPosts);
  }

  /**
   * Remove the post Display.
   */
  removePostDisplay() {
    let currentPostViews = this.mainContainer.querySelectorAll(
      "post-display-component, starred-posts-component",
    );
    for (let potentialPostDisplay of currentPostViews) {
      if (potentialPostDisplay instanceof PostDisplay || potentialPostDisplay instanceof StarredPosts) {
        potentialPostDisplay.remove();
        slog.info(
          "ChatPageComponent: removePostDisplay, removed current post display",
          ["potentialPostDisplay", potentialPostDisplay],
        );
      }
    }
  }

  /**
   * Get the starredPosts Component and then display the dialog. 
   */
  getStarredPostsComponent(){
    let starredPostsComponent = this.shadowRoot?.querySelector("starred-posts-component")
    if (!(starredPostsComponent instanceof StarredPosts)){
      throw new Error("cannot find starred-posts-component custom element")
    } 
    starredPostsComponent.displayDialog();
  }
}

export default ChatPageComponent;

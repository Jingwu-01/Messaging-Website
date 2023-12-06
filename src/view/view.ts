import { slog } from "../slog";
import PostComponent from "./components/pages/chatPage/postComponent";
import SnackbarComponent from "./components/pieces/snackbarComponent";
import {
  EventWithId,
  ViewChannel,
  ViewChannelUpdate,
  ViewPost,
  ViewPostUpdate,
  ViewUser,
  ViewWorkspace,
  ViewWorkspaceUpdate,
} from "./datatypes";

interface PostDisplayListener {
  displayPostDisplay(): void;
  removePostDisplay(): void;
}

/**
 * Interface for post listeners
 * A component that is a PostListener will receive
 * updates when the Adapter changes what posts should be displayed
 */
interface PostListener {
  /**
   * Called by the view when there is an update to the posts that should be displayed
   * @param posts Contains info about the new posts that need displaying.
   */
  displayPosts(posts: ViewPostUpdate): void;
  moveReplyPostEditorTo(postEl: PostComponent): void;
}

/**
 * Interface for user listeners.
 * A component that is a UserListener will receive updates
 * when the Adapter changes what user should be rendered.
 */
interface UserListener {
  displayUser(user: ViewUser | null): void;
}

/**
 * Interface for workspace listeners.
 * A component that is a WorkspaceListener will receive updates
 * when the Adapter changes what workspaces should be displayed
 */
interface WorkspaceListener {
  /**
   * Called by the view when there is an update to the workspaces that should be displayed
   * @param update Info about what changed
   */
  displayWorkspaces(update: ViewWorkspaceUpdate): void;
  /**
   * Called by the view when the open workspace changes.
   * @param open_workspace The new open workspace, or null if there is no open workspace.
   */
  displayOpenWorkspace(open_workspace: ViewWorkspace | null): void;
}

/**
 * Interface for channel listeners.
 * A component that is a ChannelListener will receive updates
 * when the Adapter changes what channels should be displayed.
 */
interface ChannelListener {
  /**
   * Called by the view when there is an update to the channels that should be displayed
   * @param update The new open workspace, or null if there is no open workspace.
   */
  displayChannels(update: ViewChannelUpdate): void;
  /**
   * Called by the view when the open workspace changes.
   * @param open_channel The new open channel, or null if there is no open channel.
   */
  displayOpenChannel(open_channel: ViewChannel | null): void;
}

/**
 * Interface for HTML Dialog elements.
 * Used so that we can open dialogs from the root of the app.
 */
interface Dialog extends HTMLElement {
  showModal(): void;
  close(): void;
}

/**
 * Returns True if the element is a Dialog.
 * @param element Element to check
 * @returns If the Element is a Dialog.
 */
function isDialog(element: any): element is Dialog {
  return (
    element &&
    typeof element.showModal == "function" &&
    typeof element.close == "function"
  );
}

/**
 * The View manages the app's user-interface.
 */
export class View {
  /**
   * The currently logged-in user
   */
  private user: ViewUser | null = null;

  /**
   * A list of components that should receive updates when user changes.
   */
  private userListeners: Array<UserListener> = new Array<UserListener>();

  /**
   * A list of components that should receive updates when the posts change.
   */
  private postListeners: Array<PostListener> = new Array<PostListener>();

  /**
   * A list of components that should receive updates when the workspaces change.
   */
  private workspaceListeners: Array<WorkspaceListener> =
    new Array<WorkspaceListener>();

  /**
   * A list of components that should receive update when the channels change.
   */
  private channelListeners: Array<ChannelListener> =
    new Array<ChannelListener>();

  /**
   * A list of components that should receive updates when the posts change.
   */
  private postDisplayListeners: Array<PostDisplayListener> =
    new Array<PostDisplayListener>();

  /**
   * A 2D map, where every function in eventCompletedListeners.get(event_id)
   * should get called when the Adapter finishes handling the event with event_id.
   */
  private eventCompletedListeners = new Map<
    string,
    Array<(event: EventWithId, error_message?: string) => void>
  >();

  /**
   * The workspaces that are currently rendered
   */
  private workspaces = new Array<ViewWorkspace>();

  /**
   * The workspace that is open.
   */
  private openWorkspace: ViewWorkspace | null = null;

  /**
   * The posts that are currently rendered
   */
  private posts = new Array<ViewPost>();

  /**
   * The channels that are currently rendered
   */
  private channels = new Array<ViewChannel>();

  /**
   * The channel that is open
   */
  private openChannel: ViewChannel | null = null;

  /**
   * Snackbars will render into this component.
   */
  private snackbarDisplay: HTMLElement;

  constructor() {
    let snackbarDisplay = document.querySelector("#snackbar-display");
    if (!(snackbarDisplay instanceof HTMLElement)) {
      throw new Error("main(): could not find a #snackbar-display div");
    }
    this.snackbarDisplay = snackbarDisplay;
  }

  // TODO: have an abstract superclass that adds a parent field.
  moveReplyPostEditorTo(postElement: PostComponent) {
    this.postListeners.forEach((listener) => {
      listener.moveReplyPostEditorTo(postElement);
    });
  }

  /**
   * @param listener Will receive updates when posts change
   */
  addPostListener(listener: PostListener) {
    this.postListeners.push(listener);
    // TODO: change this, is just a placeholder for now.
    // let viewPostUpdate: ViewPostUpdate = {
    //   allPosts: this.posts,
    //   op: "add",
    //   affectedPosts: new Array<ViewPost>(),
    // };
    // listener.displayPosts(viewPostUpdate);
  }

  /**
   * @param listener Will no longer receive updates when posts change
   */
  removePostListener(listener: PostListener) {
    let index = this.postListeners.indexOf(listener);
    if (index < 0) {
      throw new ReferenceError(
        "Attempted to remove a post listener that was not subscribed"
      );
    }
    this.postListeners.splice(index, 1);
  }

  /**
   * Tells the View to change which posts are rendered.
   * @param posts See documentation for ViewPostUpdate. Details about what posts changed.
   */
  displayPosts(posts: ViewPostUpdate) {
    // add a function call to modify this.posts to contain the new post
    // do the listener thing
    // temporary check for testing
    if (posts.op === "add") {
      this.posts = posts.allPosts;
    }
    this.postListeners.forEach((listener) => {
      listener.displayPosts(posts);
    });
  }

  /**
   * @param listener Will receive updates when the displayed User changes.
   */
  addUserListener(listener: UserListener) {
    this.userListeners.push(listener);
    listener.displayUser(this.user);
  }

  /**
   * Change the logged-in user that appears on-screen.
   * @param user The new user, or null if the user is logged out.
   */
  displayUser(user: ViewUser | null) {
    this.user = user;
    this.userListeners.forEach((listener) => {
      listener.displayUser(user);
    });
  }

  /**
   * @param listener Will receive updates when the displayed workspaces change.
   */
  addWorkspaceListener(listener: WorkspaceListener) {
    this.workspaceListeners.push(listener);
    listener.displayWorkspaces({
      allWorkspaces: this.workspaces,
      op: "add",
      affectedWorkspaces: this.workspaces,
      cause: new Event("listenerAdded"),
    });
    listener.displayOpenWorkspace(this.openWorkspace);
  }

  /**
   * Change which workspaces are being displayed on screen.
   * @param update See ViewWorkspaceUpdate documentation for details.
   */
  displayWorkspaces(update: ViewWorkspaceUpdate) {
    this.workspaces = update.allWorkspaces;
    this.workspaceListeners.forEach((listener) => {
      listener.displayWorkspaces(update);
    });
  }

  /**
   * Change which workspace is open on-screen.
   * @param workspace The open workspace, or null if no workspace is open.
   */
  displayOpenWorkspace(workspace: ViewWorkspace | null) {
    this.openWorkspace = workspace;
    this.workspaceListeners.forEach((listener) => {
      listener.displayOpenWorkspace(workspace);
    });
  }

  /**
   * @param listener Will receive updates when the displayed Channels are changed.
   */
  addChannelListener(listener: ChannelListener) {
    this.channelListeners.push(listener);
    listener.displayChannels({
      allChannels: this.channels,
      op: "add",
      affectedChannels: this.channels,
      cause: new Event("listenerAdded"),
    });
    listener.displayOpenChannel(this.openChannel);
  }

  /**
   * Change which channels are displayed on-screen.
   */
  displayChannels(update: ViewChannelUpdate) {
    this.channels = update.allChannels;
    this.channelListeners.forEach((listener) => {
      listener.displayChannels(update);
    });
  }

  /**
   * Change which channel is currently open on-screen
   * @param channel The channel that should be displayed
   */
  displayOpenChannel(channel: ViewChannel | null) {
    this.openChannel = channel;
    this.channelListeners.forEach((listener) => {
      listener.displayOpenChannel(channel);
    });
  }

  addPostDisplayListener(listener: PostDisplayListener) {
    this.postDisplayListeners.push(listener);
    slog.info(
      "View: addPostDisplayListener",
      ["listener", listener],
      ["this.postDisplayListeners", this.postDisplayListeners]
    );
  }

  removePostDisplayListener(listener: PostDisplayListener) {
    let index = this.postDisplayListeners.indexOf(listener);
    slog.info(
      "View: removePostDisplayListener",
      ["listener", listener],
      ["index", index]
    );
    if (index < 0) {
      throw new ReferenceError(
        "Attempted to remove a post display listener that was not subscribed"
      );
    }
    this.postDisplayListeners.splice(index, 1);
    slog.info("View: removePostDisplayListener, after removing listener", [
      "this.postDisplayListeners",
      this.postDisplayListeners,
    ]);
  }

  displayPostDisplay() {
    slog.info("displayPostDisplay: was called");
    this.postDisplayListeners.forEach((listener) => {
      listener.displayPostDisplay();
    });
  }

  removePostDisplay() {
    this.postDisplayListeners.forEach((listener) => {
      listener.removePostDisplay();
    });
  }

  /**
   * When the Adapter calls .completeEvent(event), callback will be called.
   */
  waitForEvent(
    id: string,
    callback: (event: EventWithId, error?: string) => void
  ) {
    let arr = this.eventCompletedListeners.get(id);
    if (!arr) {
      arr = [];
      this.eventCompletedListeners.set(id, arr);
    }
    arr.push(callback);
  }

  /** The Adapter should call this when an event passed to it by the View is completed. */
  completeEvent(event: EventWithId) {
    this.eventCompletedListeners.get(event.detail.id)?.forEach((callback) => {
      callback(event);
    });
  }

  /** The Adapter should call this when an event passed to it by the View results in an error. */
  failEvent(event: EventWithId, error_message: string) {
    this.displayError(error_message);
    this.eventCompletedListeners.get(event.detail.id)?.forEach((callback) => {
      callback(event, error_message);
    });
  }

  /** Displays the given error message to the user. */
  displayError(message: string) {
    // Display a snackbar
    this.openSnackbar("error", message);
  }

  /** Opens a snackbar with the given level and message.  */
  openSnackbar(level: string, message: string) {
    const snackbarEl = new SnackbarComponent();
    snackbarEl.innerHTML = `<p slot="content">${message}</p>`;
    snackbarEl.setAttribute("level", level);
    this.snackbarDisplay.appendChild(snackbarEl);
  }

  // Unfortunately, we have to do it this way since dialogs need
  // to be at the root of the application to work properly. This is because
  // they should render on top of everything else, and, if they're nested in a parent component,
  // they might be affected by the styles of that parent. E.G if parent has "display: none",
  // then the dialog won't ever render.

  /** Opens the dialog with the given ID. */
  openDialog(dialog_id: string) {
    let dialog_query = document.querySelector(`#${dialog_id}`);
    if (isDialog(dialog_query)) {
      // Move the snackbar display into the dialog
      // This way it'll render on the top layer
      dialog_query.appendChild(this.snackbarDisplay);
      dialog_query.showModal();
      dialog_query.addEventListener("close", () => {
        // When the dialog is closed, move the snackbar display back to the document
        document.body.appendChild(this.snackbarDisplay);
      });
    } else {
      throw Error(`No dialog with ID ${dialog_id}`);
    }
  }

  openStarredPostsDialog() {
    const starredPostsComponent = document.querySelector(
      "starred-posts-component"
    );
    if (!(starredPostsComponent instanceof HTMLElement)) {
      throw Error("cannot find starred-posts-component HTMLElement");
    }
    const starredPostsComponentShadowRoot = starredPostsComponent.shadowRoot;
    if (starredPostsComponentShadowRoot) {
      const starredPostDialog = starredPostsComponentShadowRoot.querySelector(
        "starred-posts-dialog"
      );
      if (starredPostDialog instanceof HTMLDialogElement) {
        starredPostDialog.showModal();
      }
    }
  }

  getUser() {
    return this.user;
  }

  setHomePage() {
    // TODO: erroneous; just need it for compiler checks
  }
}

// view singleton
let lazyView: View | null = null;
// NOTE: this is a LAZY view now

/** Gets the view singleton object */
export function getView() {
  if (lazyView === null) {
    lazyView = new View();
    return lazyView;
  }
  return lazyView;
}

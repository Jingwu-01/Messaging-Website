import { slog } from "../slog";
import PostComponent from "./components/pages/chatPage/postComponent";
import SnackbarComponent from "./components/pieces/snackbarComponent";
import {
  EventWithId,
  StateName,
  ViewChannel,
  ViewChannelUpdate,
  ViewPost,
  ViewPostUpdate,
  ViewUser,
  ViewWorkspace,
  ViewWorkspaceUpdate,
} from "./datatypes";
import escapeString from "./utils";

/**
 * interface for posts display that could display posts display or remove post display
 */
export interface PostDisplayListener {
  displayPostDisplay(): void;
  removePostDisplay(): void;
}

/**
 * Interface for post listeners
 * A component that is a PostListener will receive
 * updates when the Adapter changes what posts should be displayed
 */
export interface PostListener {
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
export interface UserListener {
  displayUser(user: ViewUser | null): void;
}

/**
 * Interface for workspace listeners.
 * A component that is a WorkspaceListener will receive updates
 * when the Adapter changes what workspaces should be displayed
 */
export interface WorkspaceListener {
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
 *
 * Interface for channel listeners.
 * A component that is a ChannelListener will receive updates
 * when the Adapter changes what channels should be displayed.
 */
export interface ChannelListener {
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
 * Interface for loading listeners.
 * If the adapter marks some application state as "invalid",
 * then a component that is a LoadingListener will receive
 * that update and can interact accordingly
 */
export interface LoadingListener {
  /**
   * Called by the view when state is loading
   * @param state The name of the state that is loading
   */
  onLoading(state: StateName): void;
  /**
   * Called by the view when state is finished loading
   * @param state The name of the state that finished loading
   */
  onEndLoading(state: StateName): void;
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
   * A map of state to the things it should block.
   */
  private eventsBlockingState = new Map<StateName, Set<string>>();

  /**
   * A list of components that should update when the loading are finished.
   */
  private loadingListeners = new Array<LoadingListener>();

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

  /**
   * Constructor for the view.
   */
  constructor() {
    let snackbarDisplay = document.querySelector("#snackbar-display");
    if (!(snackbarDisplay instanceof HTMLElement)) {
      throw new Error("main(): could not find a #snackbar-display div");
    }
    this.snackbarDisplay = snackbarDisplay;
  }

  /**
   * For each post listner, move reply post editor.
   */
  moveReplyPostEditorTo(postElement: PostComponent) {
    this.postListeners.forEach((listener) => {
      listener.moveReplyPostEditorTo(postElement);
    });
  }

  /**
   * Will receive updates when posts change
   * @param listener
   */
  addPostListener(listener: PostListener) {
    this.postListeners.push(listener);
    let viewPostUpdate: ViewPostUpdate = {
      allPosts: this.posts,
      op: "add",
      affectedPosts: new Array<ViewPost>(),
      starOp: "nop",
    };
    listener.displayPosts(viewPostUpdate);
  }

  /**
   * Will no longer receive updates when posts change
   * @param listener
   */
  removePostListener(listener: PostListener) {
    let index = this.postListeners.indexOf(listener);
    if (index < 0) {
      throw new ReferenceError(
        "Attempted to remove a post listener that was not subscribed",
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
   * Will receive updates when the displayed User changes.
   * @param listener UserListener
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
   * Will receive updates when the displayed workspaces change.
   * @param listener WorkspaceListener
   */
  addWorkspaceListener(listener: WorkspaceListener) {
    this.workspaceListeners.push(listener);
    listener.displayWorkspaces({
      allWorkspaces: this.workspaces,
      op: "add",
      affectedWorkspaces: this.workspaces,
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
   * Will receive updates when the displayed Channels are changed.
   * @param listener ChannelListener
   */
  addChannelListener(listener: ChannelListener) {
    this.channelListeners.push(listener);
    listener.displayChannels({
      allChannels: this.channels,
      op: "add",
      affectedChannels: this.channels,
    });
    listener.displayOpenChannel(this.openChannel);
  }

  /**
   * Change which channels are displayed on-screen.
   * @param update ViewChannelUpdate
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

  /**
   * add a post display listener
   * @param listener PostDisplayListener
   */
  addPostDisplayListener(listener: PostDisplayListener) {
    this.postDisplayListeners.push(listener);
    slog.info(
      "View: addPostDisplayListener",
      ["listener", listener],
      ["this.postDisplayListeners", this.postDisplayListeners],
    );
  }

  /**
   * remove a post display listener
   * @param listener PostDisplayListener
   */
  removePostDisplayListener(listener: PostDisplayListener) {
    let index = this.postDisplayListeners.indexOf(listener);
    slog.info(
      "View: removePostDisplayListener",
      ["listener", listener],
      ["index", index],
    );
    if (index < 0) {
      throw new ReferenceError(
        "Attempted to remove a post display listener that was not subscribed",
      );
    }
    this.postDisplayListeners.splice(index, 1);
    slog.info("View: removePostDisplayListener, after removing listener", [
      "this.postDisplayListeners",
      this.postDisplayListeners,
    ]);
  }

  /**
   * Display post display.
   */
  displayPostDisplay() {
    slog.info("displayPostDisplay: was called");
    this.postDisplayListeners.forEach((listener) => {
      listener.displayPostDisplay();
    });
  }

  /**
   * remove post display.
   */
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
    callback: (event: EventWithId, error?: string) => void,
  ) {
    let arr = this.eventCompletedListeners.get(id);
    if (!arr) {
      arr = [];
      this.eventCompletedListeners.set(id, arr);
    }
    arr.push(callback);
  }

  /**
   * The Adapter should call this when an event passed to it by the View is completed.
   */
  completeEvent(event: EventWithId) {
    this.eventCompletedListeners.get(event.detail.id)?.forEach((callback) => {
      callback(event);
    });
    this.eventCompletedListeners.delete(event.detail.id);
  }

  /**
   * The Adapter should call this when an event passed to it by the View results in an error.
   */
  failEvent(event: EventWithId, error_message: string) {
    this.displayError(error_message);
    this.eventCompletedListeners.get(event.detail.id)?.forEach((callback) => {
      callback(event, error_message);
    });
    this.eventCompletedListeners.delete(event.detail.id);
  }

  /**
   * The Adapter should call this when an event is in progress
   * that is actively modifying the state referred to by state.
   * @param state The state that is being modified.
   * @param event The event that is causing the state to be modified
   */
  setStateLoadingUntil(
    state: StateName | Array<StateName>,
    event: EventWithId,
  ) {
    let state_array = Array.isArray(state) ? state : [state];
    state_array.forEach((state) => {
      let event_set = this.eventsBlockingState.get(state);
      // If this piece of state wasn't waiting for an event to complete
      if (!event_set) {
        event_set = new Set<string>();
        slog.info(`${state} are now loading`);
        // Notify all of the loading listeners that this state is now loading
        this.loadingListeners.forEach((listener) => {
          listener.onLoading(state);
        });
      }
      if (!event_set.has(event.detail.id)) {
        // Track that we're loading until the event completes
        event_set.add(event.detail.id);
        this.eventsBlockingState.set(state, event_set);
      }
      // When this event completes, remove from the eventsBlockingState.
      this.waitForEvent(event.detail.id, () => {
        this.eventsBlockingState.get(state)?.delete(event.detail.id);
        // If that was the only event causing the state to be pending,
        // then stop the state from loading.
        if (this.eventsBlockingState.get(state)?.size == 0) {
          this.eventsBlockingState.delete(state);
          slog.info(`${state} is no longer loading`);
          this.loadingListeners.forEach((listener) => {
            listener.onEndLoading(state);
          });
        }
      });
    });
  }

  /**
   * When the Adapter marks this state as invalid, the loading listener will listen for it.
   * @param listener The listener to wait fo
   */
  addLoadingListener(listener: LoadingListener) {
    this.loadingListeners.push(listener);
    for (let key of this.eventsBlockingState.keys()) {
      listener.onLoading(key);
    }
  }

  /**
   * Displays the given error message to the user.
   */
  displayError(message: string) {
    // Display a snackbar
    this.openSnackbar("error", message);
  }

  /**
   * Opens a snackbar with the given level and message.
   */
  openSnackbar(level: string, message: string) {
    const snackbarEl = new SnackbarComponent();
    snackbarEl.innerHTML = `<p slot="content">${escapeString(message)}</p>`;
    snackbarEl.setAttribute("level", level);
    this.snackbarDisplay.appendChild(snackbarEl);
  }

  /**
   * Opens the dialog with the given ID.
   */
  openDialog(dialog_id: string) {
    // Unfortunately, we have to do it this way since dialogs need
    // to be at the root of the application to work properly. This is because
    // they should render on top of everything else, and, if they're nested in a parent component,
    // they might be affected by the styles of that parent. E.G if parent has "display: none",
    // then the dialog won't ever render.
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

  /**
   * Get the username that is logged in
   * @returns string of username
   */
  getUser() {
    return this.user;
  }

  /**
   * Set the homepage.
   */
  setHomePage() {
    // Need it for compiler checks
  }
}

/** view singleton */
// NOTE: this is a LAZY view now
let lazyView: View | null = null;

/**
 * Gets the view singleton object
 */
export function getView() {
  if (lazyView === null) {
    lazyView = new View();
    return lazyView;
  }
  return lazyView;
}

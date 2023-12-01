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

interface PostListener {
  displayPosts(posts: ViewPostUpdate): void;
  moveReplyPostEditorTo(postEl: PostComponent): void;
  moveEditPostEditorTo(postEl: PostComponent): void;
}

interface UserListener {
  displayUser(user: ViewUser | null): void;
}

interface WorkspaceListener {
  displayWorkspaces(update: ViewWorkspaceUpdate): void;
  displayOpenWorkspace(open_workspace: ViewWorkspace | null): void;
}

interface ChannelListener {
  displayChannels(update: ViewChannelUpdate): void;
  displayOpenChannel(open_channel: ViewChannel | null): void;
}

interface Dialog extends HTMLElement {
  showModal(): void;
  close(): void;
}

function isDialog(element: any): element is Dialog {
  return (
    element &&
    typeof element.showModal == "function" &&
    typeof element.close == "function"
  );
}

// TODO: think about how to consoldiate all functionality in the view?
export class View {
  private user: ViewUser | null = null;

  private userListeners: Array<UserListener> = new Array<UserListener>();

  private postListeners: Array<PostListener> = new Array<PostListener>();

  private workspaceListeners: Array<WorkspaceListener> =
    new Array<WorkspaceListener>();

  private channelListeners: Array<ChannelListener> =
    new Array<ChannelListener>();

  private postDisplayListeners: Array<PostDisplayListener> =
    new Array<PostDisplayListener>();

  private eventCompletedListeners = new Map<
    string,
    Array<(event: EventWithId, error_message?: string) => void>
  >();

  private workspaces = new Array<ViewWorkspace>();

  private openWorkspace: ViewWorkspace | null = null;

  private posts = new Array<ViewPost>();

  private channels = new Array<ViewChannel>();

  private openChannel: ViewChannel | null = null;

  // Snackbars will render into this component
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

  moveEditPostEditorTo(postElement: PostComponent) {
    this.postListeners.forEach((listener) => {
      listener.moveEditPostEditorTo(postElement);
    });
  }

  addPostListener(listener: PostListener) {
    this.postListeners.push(listener);
    // TODO: change this, is just a placeholder for now.
    let viewPostUpdate: ViewPostUpdate = {
      allPosts: this.posts,
      op: "add",
      affectedPosts: new Array<ViewPost>(),
    };
    listener.displayPosts(viewPostUpdate);
  }

  removePostListener(listener: PostListener) {
    let index = this.postListeners.indexOf(listener);
    if (index < 0) {
      throw new ReferenceError(
        "Attempted to remove a post listener that was not subscribed"
      );
    }
    this.postListeners.splice(index, 1);
  }

  displayPosts(posts: ViewPostUpdate) {
    // add a function call to modify this.posts to contain the new post
    // do the listener thing
    // temporary check for testing
    if (posts.op !== "insert") {
      this.posts = posts.allPosts;
    }
    this.postListeners.forEach((listener) => {
      listener.displayPosts(posts);
    });
  }

  addUserListener(listener: UserListener) {
    this.userListeners.push(listener);
    listener.displayUser(this.user);
  }

  displayUser(user: ViewUser | null) {
    this.user = user;
    this.userListeners.forEach((listener) => {
      listener.displayUser(user);
    });
  }

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

  displayWorkspaces(update: ViewWorkspaceUpdate) {
    this.workspaces = update.allWorkspaces;
    this.workspaceListeners.forEach((listener) => {
      listener.displayWorkspaces(update);
    });
  }

  displayOpenWorkspace(workspace: ViewWorkspace | null) {
    this.openWorkspace = workspace;
    this.workspaceListeners.forEach((listener) => {
      listener.displayOpenWorkspace(workspace);
    });
  }

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

  displayChannels(update: ViewChannelUpdate) {
    this.channels = update.allChannels;
    this.channelListeners.forEach((listener) => {
      listener.displayChannels(update);
    });
  }

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

  // When the Adapter calls .completeEvent(event),
  // callback will be called.
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

  // The Adapter should call this when an event passed to it by the View is completed.
  completeEvent(event: EventWithId) {
    this.eventCompletedListeners.get(event.detail.id)?.forEach((callback) => {
      callback(event);
    });
  }

  // The Adapter should call this when an event passed to it by the View results in an error.
  failEvent(event: EventWithId, error_message: string) {
    this.displayError(error_message);
    this.eventCompletedListeners.get(event.detail.id)?.forEach((callback) => {
      callback(event, error_message);
    });
  }

  // Displays the given error message to the user.
  displayError(message: string) {
    // Display a snackbar
    this.openSnackbar("error", message);
  }

  // Opens a snackbar with the given level and message.
  openSnackbar(level: string, message: string) {
    const snackbarEl = new SnackbarComponent();
    snackbarEl.innerHTML = `<p slot="content">${message}</p>`;
    snackbarEl.setAttribute("level", level);
    this.snackbarDisplay.appendChild(snackbarEl);
  }

  // Opens the dialog with the given ID.
  // Unfortunately, we have to do it this way since dialogs need
  // to be at the root of the application to work properly. This is because
  // they should render on top of everything else, and, if they're nested in a parent component,
  // they might be affected by the styles of that parent. E.G if parent has "display: none",
  // then the dialog won't ever render.
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

  // Closes the dialog with the given ID
  // closeDialog(dialog_id: string) {
  //   let dialog_query = document.querySelector(`#${dialog_id}`);
  //   if (isDialog(dialog_query)) {
  //     this.currentlyOpenDialog = null;
  //     dialog_query.close();
  //   } else {
  //     throw Error(`No dialog with ID ${dialog_id}`);
  //   }
  // }

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
export function getView() {
  if (lazyView === null) {
    lazyView = new View();
    return lazyView;
  }
  return lazyView;
}

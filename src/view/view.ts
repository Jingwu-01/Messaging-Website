import { PostEditor } from "./components/pages/chatPage/postEditorComponent";
import M3ssagin8AppComponent from "./components/pages/m3ssagin8AppComponent";
import { ViewChannel, ViewPost, ViewUser, ViewWorkspace } from "./datatypes";

interface PostListener {
  displayPosts(posts: Array<ViewPost>): void;
  displayPostEditor(): void;
  removePostEditor(): void;
  replacePostEditor(newPostEditor: PostEditor): void;
}

interface UserListener {
  displayUser(user: ViewUser | null): void;
}

interface WorkspaceListener {
  displayWorkspaces(workspaces: Array<ViewWorkspace>): void;
  displayOpenWorkspace(open_workspace: ViewWorkspace | null): void;
}

interface ChannelListener {
  displayChannels(channels: Array<ViewChannel>): void;
  displayOpenChannel(open_channel: ViewChannel | null): void;
}

interface Dialog {
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

  private workspaces = new Array<ViewWorkspace>();

  private openWorkspace: ViewWorkspace | null = null;

  private posts = new Array<ViewPost>();

  private channels = new Array<ViewChannel>();

  private openChannel: ViewChannel | null = null;

  private m3ssag1n8AppComponent: M3ssagin8AppComponent | null = null;

  constructor() {
    let m3ssag1n8AppComponent = document.querySelector(
      "m3ssagin8-app-component"
    );
    if (!(m3ssag1n8AppComponent instanceof M3ssagin8AppComponent)) {
      throw Error("main(): could not find a m3ssagin8-app-component element");
    }
    this.m3ssag1n8AppComponent = m3ssag1n8AppComponent;
  }

  displayPostEditor() {
    this.postListeners.forEach((listener) => {
      listener.displayPostEditor();
    });
  }

  removePostEditor() {
    this.postListeners.forEach((listener) => {
      listener.removePostEditor();
    });
  }

  replacePostEditor(newPostEditor: PostEditor) {
    this.postListeners.forEach((listener) => {
      listener.replacePostEditor(newPostEditor);
    });
  }

  setChatPage() {
    this.m3ssag1n8AppComponent?.setChatPage();
  }

  setHomePage() {
    this.m3ssag1n8AppComponent?.setHomePage();
  }

  addPostListener(listener: PostListener) {
    this.postListeners.push(listener);
    listener.displayPosts(this.posts);
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

  displayPosts(posts: Array<ViewPost>) {
    this.posts = posts;
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
    listener.displayWorkspaces(this.workspaces);
    listener.displayOpenWorkspace(this.openWorkspace);
  }

  displayWorkspaces(workspaces: Array<ViewWorkspace>) {
    this.workspaces = workspaces;
    this.workspaceListeners.forEach((listener) => {
      listener.displayWorkspaces(workspaces);
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
    listener.displayChannels(this.channels);
    listener.displayOpenChannel(this.openChannel);
  }

  displayChannels(channels: Array<ViewChannel>) {
    this.channels = channels;
    this.channelListeners.forEach((listener) => {
      listener.displayChannels(channels);
    });
  }

  displayOpenChannel(channel: ViewChannel | null) {
    this.openChannel = channel;
    this.channelListeners.forEach((listener) => {
      listener.displayOpenChannel(channel);
    });
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
      dialog_query.showModal();
    } else {
      throw Error(`No dialog with ID ${dialog_id}`);
    }
  }

  // Closes the dialog with the given ID
  closeDialog(dialog_id: string) {
    let dialog_query = document.querySelector(`#${dialog_id}`);
    if (isDialog(dialog_query)) {
      dialog_query.close();
    } else {
      throw Error(`No dialog with ID ${dialog_id}`);
    }
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

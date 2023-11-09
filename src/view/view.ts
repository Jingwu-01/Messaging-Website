import M3ssagin8AppComponent from "./components/pages/m3ssagin8AppComponent";
import { ViewChannel, ViewPost, ViewUser, ViewWorkspace } from "./datatypes";

interface PostListener {
  displayPosts(posts: Array<ViewPost>): void;
}

interface UserListener {
  displayUser(user: ViewUser): void;
}

interface WorkspaceListener {
  displayWorkspaces(workspaces: Array<ViewWorkspace>): void;
  displayOpenWorkspace(open_workspace: ViewWorkspace): void;
}

interface ChannelListener {
  displayOpenChannel(open_channel: ViewChannel): void;
  displayChannels(channels: Array<ViewChannel>): void;
}

// TODO: think about how to consoldiate all functionality in the view?
export class View {
   private postListener: PostListener | null = null;

   private m3ssag1n8AppComponent: M3ssagin8AppComponent | null = null;

   constructor() {
    let m3ssag1n8AppComponent = document.querySelector("m3ssagin8-app-component");
    if (!(m3ssag1n8AppComponent instanceof M3ssagin8AppComponent)) {
      throw Error("main(): could not find a m3ssagin8-app-component element");
    }
    this.m3ssag1n8AppComponent = m3ssag1n8AppComponent;
   }


   setPostListener(listener: PostListener) {
    console.log(`setPostListener: listener: ${listener}`);
    this.postListener = listener;
   }

   clearPostListener() {
    this.postListener = null;
   }

   displayPosts(posts: Array<ViewPost>) {
    this.postListener?.displayPosts(posts);
   }

   setChatPage() {
    this.m3ssag1n8AppComponent?.setChatPage();
   }

   setHomePage() {
    this.m3ssag1n8AppComponent?.setHomePage();
   }

  private userListeners: Array<UserListener> = new Array<UserListener>();

  private workspaceListeners: Array<WorkspaceListener> =
    new Array<WorkspaceListener>();

//   private postListeners: Array<PostListener> = new Array<PostListener>();

//   addPostListener(listener: PostListener) {
//     this.postListeners.push(listener);
//   }

  addUserListener(listener: UserListener) {
    this.userListeners.push(listener);
  }

  addWorkspaceListener(listener: WorkspaceListener) {
    this.workspaceListeners.push(listener);
  }

  displayUser(user: ViewUser) {
    this.userListeners.forEach((listener) => {
      listener.displayUser(user);
    });
  }

  displayWorkspaces(workspaces: Array<ViewWorkspace>) {
    this.workspaceListeners.forEach((listener) => {
      listener.displayWorkspaces(workspaces);
    });
  }

  displayOpenWorkspace(workspace: ViewWorkspace) {
    this.workspaceListeners.forEach((listener) => {
      listener.displayOpenWorkspace(workspace);
    });
  }

  addChannelListener(listener: ChannelListener) {
    // TODO: add functionality
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

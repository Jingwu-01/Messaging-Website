import { PostDisplay } from "./components/pages/chatPage/postDisplayComponent";
import { ViewPost, ViewUser, ViewWorkspace } from "./datatypes";

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

// TODO: think about how to consoldiate all functionality in the view?
export class View {
  private postsDisplay: PostDisplay | null = null;

  private userListeners: Array<UserListener> = new Array<UserListener>();

  private workspaceListeners: Array<WorkspaceListener> =
    new Array<WorkspaceListener>();

  constructor() {
    this.postsDisplay = document.querySelector("post-display");
    if (!(this.postsDisplay instanceof PostDisplay)) {
      console.log("");
    }
  }

  private postListeners: Array<PostListener> = new Array<PostListener>();

  addPostListener(listener: PostListener) {
    this.postListeners.push(listener);
  }

  addUserListener(listener: UserListener) {
    this.userListeners.push(listener);
  }

  addWorkspaceListener(listener: WorkspaceListener) {
    this.workspaceListeners.push(listener);
  }

  displayPosts(posts: Array<ViewPost>) {
    this.postListeners.forEach((listener) => {
      listener.displayPosts(posts);
    });
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
}

// view singleton
let view: View = new View();
export function getView() {
  return view;
}

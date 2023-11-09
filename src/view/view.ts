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
   private postListener: PostListener | null = null;

   constructor() {
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
}

// view singleton
let view: View = new View();
export function getView() {
  return view;
}

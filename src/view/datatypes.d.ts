export type ViewPostUpdate = {
  allPosts: Array<ViewPost>;
  op: "add" | "modify";
  affectedPosts: Array<ViewPost>;
};

// This ViewPost type will effectively allow us to represent a tree of posts
// that the view can display.
export type ViewPost = {
  msg: string;
<<<<<<< HEAD
  reactions: ReactionData;
=======
  reactions: ReactionData | undefined; // TODO: should be an array of strings? or custom reactions objects based on what we want?
>>>>>>> feature/schemaValidation
  extensions: any; // TODO: see above for 'reactions'
  createdUser: string;
  postTime: number;
  children: Array<ViewPost>;
  path: string;
  parent: string | undefined;
};

export type ViewWorkspaceUpdate = {
  allWorkspaces: Array<ViewWorkspace>;
  op: "add" | "remove" | "replace";
  // NOTE: deltas aren't implemented yet, so this won't contain accurate data
  affectedWorkspaces: Array<ViewWorkspace>;
  cause: Event;
};

export type ViewChannelUpdate = {
  allChannels: Array<ViewChannel>;
  op: "add" | "remove" | "replace";
  // NOTE: deltas aren't implemented yet, so this won't contain accurate data
  affectedChannels: Array<ViewWorkspace>;
  cause: Event;
};

export type ReactionData = {
  smile: string[];
  frown: string[];
  like: string[];
  celebrate: string[];
};

export type ViewUser = {
  username: string;
};

export type ViewWorkspace = {
  name: string;
};

export type ViewChannel = {
  name: string;
};

export type LoginEvent = {
  username: string;
};

export type LogoutEvent = {};

export type CreateWorkspaceEvent = {
  name: string;
};

export type SelectWorkspaceEvent = {
  name: string;
};

export type DeleteWorkspaceEvent = {
  name: string;
};

export type CreateChannelEvent = {
  name: string;
};

export type SelectChannelEvent = {
  name: string;
};

export type DeleteChannelEvent = {
  name: string;
};

export type ReactionUpdateEvent = {
  reactionName: string;
};

export type CreatePostEvent = {
  msg: string;
  parent: string;
};

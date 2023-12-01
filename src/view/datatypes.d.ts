export type ViewPostUpdate = {
  allPosts: Array<ViewPost>;
  op: "add" | "modify" | "insert";
  affectedPosts: Array<ViewPost>;
};

// This ViewPost type will effectively allow us to represent a tree of posts
// that the view can display.
export type ViewPost = {
  msg: string;
  reactions: ReactionData; // TODO: should be an array of strings? or custom reactions objects based on what we want?
  extensions: any; // TODO: see above for 'reactions'
  createdUser: string;
  postTime: number;
  children: Array<ViewPost>;
  path: string;
  parent: string | undefined;
  postIdx: number | undefined;
  name: string;
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
  [k: string]: string[];
};

export type PostReactions = {
  [k: string]: string[];
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
  id: string;
};

export type LogoutEvent = {};

export type CreateWorkspaceEvent = {
  name: string;
  id: string;
};

export type SelectWorkspaceEvent = {
  name: string;
  id: string;
};

export type DeleteWorkspaceEvent = {
  name: string;
  id: string;
};

export type CreateChannelEvent = {
  name: string;
  id: string;
};

export type SelectChannelEvent = {
  name: string;
  id: string;
};

export type DeleteChannelEvent = {
  name: string;
  id: string;
};

export type ReactionUpdateEvent = {
  reactionName: string;
  userName: string | undefined;
  postPath: string;
  add: boolean;
};

export type CreatePostEvent = {
  msg: string;
  parent: string;
};

export type RefreshWorkspacesEvent = {
  id: string;
};

export type RefreshChannelsEvent = {
  id: string;
};

export interface EventWithId extends CustomEvent {
  detail: {
    id: string;
    [key: string]: any;
  };
}

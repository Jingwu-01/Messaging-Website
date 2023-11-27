// This ViewPost type will effectively allow us to represent a tree of posts
// that the view can display.
export type ViewPost = {
  Msg: string;
  Reactions: ReactionData; // TODO: should be an array of strings? or custom reactions objects based on what we want?
  Extensions: any; // TODO: see above for 'reactions'
  CreatedUser: string;
  PostTime: number;
  Children: Array<ViewPost>;
  Path: string;
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

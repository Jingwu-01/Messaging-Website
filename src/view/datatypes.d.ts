/**
 * Update sent by the Adapter to the view when the posts change
 */
export type ViewPostUpdate = {
  /**
   * List of all posts that should be displayed
   */
  allPosts: Array<ViewPost>;
  /**
   * "insert" = a new post was added
   * "modify" = something changed about a post
   */
  op: "add" | "modify" | "insert";
  /** A list of the posts that were affected by this update */
  affectedPosts: Array<ViewPost>;
  starOp: "insert" | "modify" | "delete" | "nop";
};

/**
 * This ViewPost type will effectively allow us to represent a tree of posts
that the view can display.
 */
export type ViewPost = {
  msg: string;
  reactions: ReactionData; // TODO: should be an array of strings? or custom reactions objects based on what we want?
  extensions: StarExtension; // TODO: see above for 'reactions'
  createdUser: string;
  postTime: number;
  children: Array<ViewPost>;
  path: string;
  parent: string | undefined;
  postIdx: number | undefined;
  name: string;
  starredIndex: number | undefined;
};

/**
 * StarExtention contains an array of usernames that starred a post. 
 */
export type StarExtension = {
  p2group50: Array<string>;
};

/**
 * Update sent by the Adapter to the view when the workspaces change
 */
export type ViewWorkspaceUpdate = {
  /**
   * List of all workspaces that should be displayed
   */
  allWorkspaces: Array<ViewWorkspace>;
  /**
   * "add" = a new workspace was added
   * "remove" = a workspace was removed
   * "replace" = the old workspaces are being completely replaced with affectedWorkspaces
   */
  op: "add" | "remove" | "replace";
  /**
   * List of all workspaces affected by this update
   */
  affectedWorkspaces: Array<ViewWorkspace>;
};

/**
 * Update sent by the Adapter to the view when a channel changes.
 */
export type ViewChannelUpdate = {
  /**
   * List of all channels that should be displayed
   */
  allChannels: Array<ViewChannel>;
  /**
   * "add" = a new channel was added
   * "remove" = a channel was removed
   * "replace" = the old channels are being completely replaced with affectedChannels
   */
  op: "add" | "remove" | "replace";
  /**
   * List of all channels affected by this update
   */
  affectedChannels: Array<ViewWorkspace>;
};

/**
 * ReactionData have fields including smiles, frown, like and celebrate. 
 */
export type ReactionData = {
  smile: string[];
  frown: string[];
  like: string[];
  celebrate: string[];
  [k: string]: string[];
};

/**
 * PostReactions should empty if nothing goes wrong.
 */
export type PostReactions = {
  [k: string]: string[];
};

/**
 * A user that can be displayed by the view
 */
export type ViewUser = {
  username: string;
};

/**
 * A workspace that can be displayed by the view
 */
export type ViewWorkspace = {
  name: string;
};

/**
 * A channel that can be displayed by the view
 */
export type ViewChannel = {
  name: string;
};

/**
 * Sent to the Adapter when the login button is pressed
 */
export type LoginEvent = {
  username: string;
  id: string;
};

/**
 * Sent to the Adapter when the logout button is pressed
 */
export type LogoutEvent = {
  id: string;
};

/**
 * Sent to the Adapter when a workspace is created
 */
export type CreateWorkspaceEvent = {
  name: string;
  id: string;
};

/**
 * Sent to the Adapter when a workspace is selected
 */
export type SelectWorkspaceEvent = {
  name: string;
  id: string;
};

/**
 * Sent to the Adapter when a workspace is deleted
 */
export type DeleteWorkspaceEvent = {
  name: string;
  id: string;
};

/**
 * Sent to the Adapter when a channel is created
 */
export type CreateChannelEvent = {
  name: string;
  id: string;
};

/**
 * Sent to the Adapter when a channel is selected
 */
export type SelectChannelEvent = {
  name: string;
  id: string;
};

/**
 * Sent to the Adapter when a channel is deleted
 */
export type DeleteChannelEvent = {
  name: string;
  id: string;
};

/**
 * Sent to the Adapter when a post is reacted to
 */
// TODO: use composition of ReactionUpdateEvent and StarUpdateEvent?
export type ReactionUpdateEvent = {
  reactionName: string | undefined;
  userName: string;
  postPath: string;
  add: boolean;
};

/**
 * Sent to the Adapter when a post is created
 */
export type CreatePostEvent = {
  msg: string;
  parent: string;
};

/**
 * Sent to the Adapter when the "refresh workspaces" button is pressed
 */
export type RefreshWorkspacesEvent = {
  id: string;
};

/**
 * Sent to the Adapter when the "refresh channels" button is pressed
 */
export type RefreshChannelsEvent = {
  id: string;
};

/**
 * Interface for any CustomEvent that has an ID property
 */
export interface EventWithId extends CustomEvent {
  detail: {
    id: string;
    [key: string]: any;
  };
}

/**
 * the name of state can only one of "user" | "posts" | "channels" | "workspaces";
 */
export type StateName = "user" | "posts" | "channels" | "workspaces";

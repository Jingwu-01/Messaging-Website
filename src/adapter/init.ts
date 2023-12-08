import { ModelInterface, StateManagerInterface, ViewInterface } from "../interfaces";
import { AuthAdapter } from "./auth/authAdapter";
import { ChannelsAdapter } from "./channel/channelsAdapter";
import { PostsAdapter } from "./posts/postsAdapter";
import { WorkspacesAdapter } from "./workspace/workspacesAdapter";

/**
 * Initializes the event handlers for the adapter.
 */
export function initAdapter(view: ViewInterface, model: ModelInterface, stateManager: StateManagerInterface) {
  const postsAdapter = new PostsAdapter(view, model, stateManager);
  postsAdapter.initPosts();

  const channelsAdapter = new ChannelsAdapter(view, model, stateManager);
  channelsAdapter.initChannels();

  const workspacesAdapter = new WorkspacesAdapter(view, model, stateManager);
  workspacesAdapter.initWorkspaces();

  const authAdapter = new AuthAdapter(view, model, stateManager);
  authAdapter.initAuth();
}

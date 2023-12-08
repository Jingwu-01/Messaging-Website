import { initAdapter } from "./adapter/init";
import { slog } from "./slog";
import {
  LogoutEvent,
  SelectChannelEvent,
  SelectWorkspaceEvent,
  ReactionUpdateEvent,
  CreateWorkspaceEvent,
  CreateChannelEvent,
  DeleteWorkspaceEvent,
  DeleteChannelEvent,
  CreatePostEvent,
  RefreshWorkspacesEvent,
  RefreshChannelsEvent,
} from "./view/datatypes";
import { LoginEvent } from "./view/datatypes";
import { initView } from "./view/init";
import { ModelPostEvent } from "./model/modelTypes";
import {
  ModelInterface,
  StateManagerInterface,
  ViewInterface,
} from "./interfaces";
import { getView } from "./view/view";
import { getModel } from "./model/model";
import { StateManager } from "./state-manager";

/**
 * Declare names and types of environment variables.
 */
declare const process: {
  env: {
    DATABASE_HOST: string;
    DATABASE_PATH: string;
    AUTH_PATH: string;
  };
};

/**
 * Defines all the custom events that are used.
 */
declare global {
  interface DocumentEventMap {
    loginEvent: CustomEvent<LoginEvent>;
    logoutEvent: CustomEvent<LogoutEvent>;
    workspaceSelected: CustomEvent<SelectWorkspaceEvent>;
    channelSelected: CustomEvent<SelectChannelEvent>;
    reactionUpdateEvent: CustomEvent<ReactionUpdateEvent>;
    workspaceCreated: CustomEvent<CreateWorkspaceEvent>;
    channelCreated: CustomEvent<CreateChannelEvent>;
    workspaceDeleted: CustomEvent<DeleteWorkspaceEvent>;
    channelDeleted: CustomEvent<DeleteChannelEvent>;
    createPostEvent: CustomEvent<CreatePostEvent>;
    modelPostEvent: CustomEvent<ModelPostEvent>;
    refreshWorkspaces: CustomEvent<RefreshWorkspacesEvent>;
    refreshChannels: CustomEvent<RefreshChannelsEvent>;
  }
}

/**
 * Inital entry to point of the application.
 */
function main(): void {
  slog.info("Using database", [
    "database",
    `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}`,
  ]);

  const view: ViewInterface = getView();
  const model: ModelInterface = getModel();
  const stateManager: StateManagerInterface = new StateManager(view, model);

  initAdapter(view, model, stateManager);
  initView();
}

/* Register event handler to run after the page is fully loaded. */
document.addEventListener("DOMContentLoaded", () => {
  main();
});

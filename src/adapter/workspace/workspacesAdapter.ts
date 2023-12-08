import {
  ModelInterface,
  StateManagerInterface,
  ViewInterface,
} from "../../interfaces";
import { slog } from "../../slog";
import {
  CreateWorkspaceEvent,
  DeleteWorkspaceEvent,
  RefreshWorkspacesEvent,
  SelectWorkspaceEvent,
} from "../../view/datatypes";
import { modelToViewChannels, modelToViewWorkspaces } from "../utils";

/**
 * Adapter between the view and the StateManager / Model
 * for workspace-related events.
 */
export class WorkspacesAdapter {
  private view: ViewInterface;
  private model: ModelInterface;
  private stateManager: StateManagerInterface;

  constructor(
    view: ViewInterface,
    model: ModelInterface,
    stateManager: StateManagerInterface
  ) {
    this.view = view;
    this.model = model;
    this.stateManager = stateManager;
  }

  /**
   * @returns The view instance used by this WorkspaceAdapter
   */
  getView(): ViewInterface {
    return this.view;
  }

  /**
   * @returns The model instance used by this WorkspaceAdapter
   */
  getModel(): ModelInterface {
    return this.model;
  }

  /**
   * @returns The state manager instance used by this WorkspaceAdapter.
   */
  getStateManager(): StateManagerInterface {
    return this.stateManager;
  }

  /**
   * Event handler for when the user selects a new workspace.
   * @param evt The event sent by the view
   * @returns A void promise
   */
  async selectWorkspace(evt: CustomEvent<SelectWorkspaceEvent>) {
    slog.info(`Workspace selected: ${evt.detail.name}`);
    this.getView().setStateLoadingUntil(
      ["workspaces", "channels", "posts"],
      evt
    );
    // Set the open workspace
    try {
      await this.getStateManager().setOpenWorkspace(evt.detail.name);
    } catch (err) {
      this.getView().removePostDisplay();
      this.getView().failEvent(evt, "Failed to select workspace");
      return;
    }
    slog.info("initWorkspaces", [
      "Opened Channel displaying view channels",
      "",
    ]);
    this.getView().removePostDisplay();
    try {
      await this.refreshChannels(evt);
    } catch (err) {
      this.getView().failEvent(evt, "Failed to refresh channels");
      return;
    }
    this.getView().completeEvent(evt);
  }

  /**
   * Event handler for when the user creates a workspace.
   * @param evt The event sent by the view
   * @returns A void promise
   */
  async createWorkspace(evt: CustomEvent<CreateWorkspaceEvent>) {
    slog.info(`Workspace added: ${evt.detail.name}`);
    // Try to create the workspace
    try {
      await this.getModel().addWorkspace(evt.detail.name);
    } catch (err) {
      this.getView().failEvent(evt, "Failed to add workspace");
      return;
    }

    try {
      await this.refreshWorkspaces(evt);
    } catch (error) {
      this.getView().failEvent(evt, "Failed to refresh workspaces");
      return;
    }

    this.getView().completeEvent(evt);
  }

  /**
   * Event handler for when the user deletes a workspace
   * @param evt The event sent by the view
   * @returns A void promise
   */
  async deleteWorkspace(evt: CustomEvent<DeleteWorkspaceEvent>) {
    slog.info(`Workspace deleted: ${evt.detail.name}`);
    this.getView().setStateLoadingUntil(["workspaces"], evt);
    try {
      await this.getModel().removeWorkspace(evt.detail.name);
    } catch (error) {
      this.getView().failEvent(evt, "Failed to delete workspace");
    }

    try {
      await this.refreshWorkspaces(evt);
    } catch (error) {
      this.getView().failEvent(evt, "Failed to refresh workspaces");
      return;
    }

    this.getView().completeEvent(evt);
  }

  /**
   * Event handler for when the user refreshes the workspaces
   * @param evt The event sent by the view
   * @returns A void promise
   */
  async refreshWorkspacesEvent(evt: CustomEvent<RefreshWorkspacesEvent>) {
    slog.info(`Workspaces refreshed`);
    this.getView().setStateLoadingUntil(["workspaces"], evt);
    try {
      await this.refreshWorkspaces(evt);
    } catch (error) {
      this.getView().failEvent(evt, "Failed to refresh workspaces");
      return;
    }
    this.getView().completeEvent(evt);
  }

  /**
   * Event handler for when the user refreshes the channels
   * @param evt The event sent by the view
   * @returns A void promise
   */
  async refreshChannels(evt: Event) {
    // Refresh the channels in the model
    const channels = await this.getStateManager()
      .getOpenWorkspace()
      ?.getAllChannels();
    // The user should never be able to trigger this.
    if (!channels) {
      throw new Error(
        "Tried to add a channel without a workspace currently open"
      );
    }
    // Close the open channel if it doesn't exist anymore.
    let open_channel_name = this.getStateManager().getOpenChannel()?.getName();
    if (open_channel_name && !channels.has(open_channel_name)) {
      // TODO: await this?
      this.getStateManager().setOpenChannel(null);
    }
    // Tell the view that this was a success.
    this.getView().displayChannels({
      allChannels: modelToViewChannels(channels),
      op: "replace",
      affectedChannels: modelToViewChannels(channels),
    });
  }

  /**
   * Event handler for when the user refreshes the channels.
   * @param event The event sent by the view
   * @returns A void promise
   */
  async refreshWorkspaces(event: Event) {
    const workspaces = await this.getModel().getAllWorkspaces();
    // If the open workspace doesn't exist anymore, then close the open workspace.
    let open_workspace_name = this.getStateManager()
      .getOpenWorkspace()
      ?.getName();
    if (open_workspace_name && !workspaces.has(open_workspace_name)) {
      this.getStateManager().setOpenWorkspace(null);
      this.getView().displayChannels({
        allChannels: [],
        op: "replace",
        affectedChannels: [],
      });
    }
    this.getView().displayWorkspaces({
      allWorkspaces: modelToViewWorkspaces(workspaces),
      op: "replace",
      affectedWorkspaces: modelToViewWorkspaces(workspaces),
    });
  }

  /**
   * Initializes the event handlers for workspaces.
   */
  initWorkspaces() {
    // Handle workspace event
    document.addEventListener(
      "workspaceSelected",
      this.selectWorkspace.bind(this)
    );

    document.addEventListener(
      "workspaceCreated",
      this.createWorkspace.bind(this)
    );

    // Handle workspace deletion
    document.addEventListener(
      "workspaceDeleted",
      this.deleteWorkspace.bind(this)
    );

    //Handle workspace refresh
    document.addEventListener(
      "refreshWorkspaces",
      this.refreshWorkspacesEvent.bind(this)
    );
  }
}

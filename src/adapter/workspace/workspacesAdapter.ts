import { ModelInterface, StateManagerInterface, ViewInterface } from "../../interfaces";
import { slog } from "../../slog";
import { CreateWorkspaceEvent, DeleteWorkspaceEvent, RefreshChannelsEvent, RefreshWorkspacesEvent, SelectWorkspaceEvent } from "../../view/datatypes";
import { modelToViewChannels, modelToViewWorkspaces } from "../utils";

export class WorkspacesAdapter {
    private view: ViewInterface;
    private model: ModelInterface;
    private stateManager: StateManagerInterface;

    constructor(view: ViewInterface, model: ModelInterface, stateManager: StateManagerInterface) {
        this.view = view;
        this.model = model;
        this.stateManager = stateManager;
    }

    getView(): ViewInterface {
        return this.view;
    }

    getModel(): ModelInterface {
        return this.model;
    }

    getStateManager(): StateManagerInterface {
        return this.stateManager;
    }

    async selectWorkspace(evt: CustomEvent<SelectWorkspaceEvent>) {
        slog.info(`Workspace selected: ${evt.detail.name}`);
        this.getView().setStateLoadingUntil(["workspaces", "channels", "posts"], evt);
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

    async createWorkspace(evt: CustomEvent<CreateWorkspaceEvent>) {
        slog.info(`Workspace added: ${evt.detail.name}`);
        this.getView().setStateLoadingUntil(["workspaces"], evt);
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

    async deleteWorkspace(evt: CustomEvent<DeleteWorkspaceEvent>) {
        slog.info(`Workspace deleted: ${evt.detail.name}`);
        this.getView().setStateLoadingUntil(["workspaces", "channels", "posts"], evt);
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

    async refreshWorkspacesEvent(evt: CustomEvent<RefreshWorkspacesEvent>) {
        slog.info(`Workspaces refreshed`);
        this.getView().setStateLoadingUntil(["channels", "posts", "workspaces"], evt);
        try {
          await this.refreshWorkspaces(evt);
        } catch (error) {
          this.getView().failEvent(evt, "Failed to refresh workspaces");
          return;
        }
        this.getView().completeEvent(evt);
    }

    async refreshChannels(evt: Event) {
        // Refresh the channels in the model
        const channels = await this.getStateManager().getOpenWorkspace()?.getAllChannels();
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

    async refreshWorkspaces(event: Event) {
        const workspaces = await this.getModel().getAllWorkspaces();
        // If the open workspace doesn't exist anymore, then close the open workspace.
        let open_workspace_name = this.getStateManager().getOpenWorkspace()?.getName();
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
        document.addEventListener("workspaceSelected",
        this.selectWorkspace.bind(this));

        document.addEventListener("workspaceCreated",
        this.createWorkspace.bind(this));

        // Handle workspace deletion
        document.addEventListener("workspaceDeleted",
        this.deleteWorkspace.bind(this));

        //Handle workspace refresh
        document.addEventListener("refreshWorkspaces",
        this.refreshWorkspacesEvent.bind(this));
    }



}
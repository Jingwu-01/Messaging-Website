import { getModel } from "../../model/model";
import { slog } from "../../slog";
import {
  SelectWorkspaceEvent,
  CreateWorkspaceEvent,
  DeleteWorkspaceEvent,
  RefreshWorkspacesEvent,
} from "../../view/datatypes";
import { getView } from "../../view/view";
import getStateManager from "../../state-manager";
import refreshChannels from "../channel/refreshChannels";
import refreshWorkspaces from "./refreshWorkspaces";

/**
 * Initializes the event handlers for workspaces.
 */
export function initWorkspaces() {
  //Handle workspace event
  document.addEventListener(
    "workspaceSelected",
    async function (evt: CustomEvent<SelectWorkspaceEvent>) {
      slog.info(`Workspace selected: ${evt.detail.name}`);
      // Set the open workspace
      try {
        await getStateManager().setOpenWorkspace(evt.detail.name);
      } catch (err) {
        getView().removePostDisplay();
        getView().failEvent(evt, "Failed to select workspace");
        return;
      }
      slog.info("initWorkspaces", [
        "Opened Channel displaying view channels",
        "",
      ]);
      getView().removePostDisplay();
      try {
        await refreshChannels(evt);
      } catch (err) {
        getView().failEvent(evt, "Failed to refresh channels");
        return;
      }
      getView().completeEvent(evt);
    },
  );
  document.addEventListener(
    "workspaceCreated",
    async (evt: CustomEvent<CreateWorkspaceEvent>) => {
      slog.info(`Workspace added: ${evt.detail.name}`);

      // Try to create the workspace
      try {
        await getModel().addWorkspace(evt.detail.name);
      } catch (err) {
        getView().failEvent(evt, "Failed to add workspace");
        return;
      }

      try {
        await refreshWorkspaces(evt);
      } catch (error) {
        getView().failEvent(evt, "Failed to refresh workspaces");
        return;
      }

      getView().completeEvent(evt);
    },
  );

  // Handle workspace deletion
  document.addEventListener(
    "workspaceDeleted",
    async (evt: CustomEvent<DeleteWorkspaceEvent>) => {
      slog.info(`Workspace deleted: ${evt.detail.name}`);
      // If we're deleting the open workspace, then close it.
      if (evt.detail.name == getStateManager().getOpenWorkspace()?.getName()) {
        getStateManager().setOpenWorkspace(null);
      }
      try {
        await getModel().removeWorkspace(evt.detail.name);
      } catch (error) {
        getView().failEvent(evt, "Failed to delete workspace");
      }

      try {
        await refreshWorkspaces(evt);
      } catch (error) {
        getView().failEvent(evt, "Failed to refresh workspaces");
        return;
      }

      getView().completeEvent(evt);
    },
  );

  //Handle workspace refresh
  document.addEventListener(
    "refreshWorkspaces",
    async (evt: CustomEvent<RefreshWorkspacesEvent>) => {
      slog.info(`Workspaces refreshed`);

      try {
        await refreshWorkspaces(evt);
      } catch (error) {
        getView().failEvent(evt, "Failed to refresh workspaces");
        return;
      }
      getView().completeEvent(evt);
    },
  );
}

import { getModel } from "../../model/model";
import { slog } from "../../slog";
import {
  SelectWorkspaceEvent,
  CreateWorkspaceEvent,
  DeleteWorkspaceEvent,
  ViewPostUpdate,
} from "../../view/datatypes";
import { getView } from "../../view/view";
import getStateManager from "../../state-manager";
import refreshChannels from "../channel/refreshChannels";
import modelToViewWorkspaces from "./modelToViewWorkspaces";
import refreshWorkspaces from "./refreshWorkspaces";

export function initWorkspaces() {
  document.addEventListener(
    "workspaceSelected",
    async function (evt: CustomEvent<SelectWorkspaceEvent>) {
      slog.info(`Workspace selected: ${evt.detail.name}`);

      // Set the open workspace
      try {
        await getStateManager().setOpenWorkspace(evt.detail.name);
      } catch (err) {
        getView().displayError("Failed to select workspace");
      }
      slog.info("initWorkspaces", [
        "Opened Channel displaying view channels",
        "",
      ]);
      await refreshChannels(evt);
      // De-render the posts from the old channel.
      let viewPostUpdate: ViewPostUpdate = {
        allPosts: [],
        op: "add",
        affectedPosts: [],
      };
      getView().displayPosts(viewPostUpdate);
    }
  );
  document.addEventListener(
    "workspaceCreated",
    async (evt: CustomEvent<CreateWorkspaceEvent>) => {
      slog.info(`Workspace added: ${evt.detail.name}`);

      // Try to create the workspace
      try {
        await getModel().addWorkspace(evt.detail.name);
      } catch (err) {
        getView().displayError("Failed to add workspace");
      }

      await refreshWorkspaces(evt);
      getView().completeEvent(evt);
    }
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
      // TODO handle promise rejection
      await getModel().removeWorkspace(evt.detail.name);
      const workspaces = await getModel().getAllWorkspaces();
      getView().displayWorkspaces({
        allWorkspaces: modelToViewWorkspaces(workspaces),
        op: "replace",
        affectedWorkspaces: modelToViewWorkspaces(workspaces),
        cause: evt,
      });
      getView().completeEvent(evt);
    }
  );
}

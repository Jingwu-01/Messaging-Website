import { getModel } from "../../model/model";
import getStateManager from "../../state-manager";
import { getView } from "../../view/view";
import modelToViewChannels from "../channel/modelToViewChannels";
import modelToViewWorkspaces from "./modelToViewWorkspaces";

/**
 * Re-fetches the workspaces from the model and updates them in the view.
 * @param evt The event which triggered this refresh
 */
export default async function refreshWorkspaces(evt: Event) {
  const workspaces = await getModel().getAllWorkspaces();
  // If the open workspace doesn't exist anymore, then close the open workspace.
  let open_workspace_name = getStateManager().getOpenWorkspace()?.getName();
  if (open_workspace_name && !workspaces.has(open_workspace_name)) {
    getStateManager().setOpenWorkspace(null);
    getView().displayChannels({
      allChannels: [],
      op: "replace",
      affectedChannels: [],
    });
  }
  getView().displayWorkspaces({
    allWorkspaces: modelToViewWorkspaces(workspaces),
    op: "replace",
    affectedWorkspaces: modelToViewWorkspaces(workspaces),
  });
}

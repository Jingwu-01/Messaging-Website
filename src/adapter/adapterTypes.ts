import { ViewWorkspace } from "../view/datatypes";

export interface WorkspaceListener {
  displayWorkspaces(workspaces: Array<ViewWorkspace>): void;
  displayOpenWorkspace(open_workspace: ViewWorkspace): void;
}

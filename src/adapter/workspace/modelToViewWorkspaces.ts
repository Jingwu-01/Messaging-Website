import { ModelWorkspace } from "../../model/workspace";
import { ViewWorkspace } from "../../view/datatypes";

/**
 * Converts ModelWorkspaces to ViewWorkspaces
 * @param workspaces The map of workspaces to convert.
 */
export default function modelToViewWorkspaces(
  workspaces: Map<string, ModelWorkspace>,
): ViewWorkspace[] {
  let view_workspaces: ViewWorkspace[] = [];
  workspaces.forEach((ws) => {
    view_workspaces.push({
      name: ws.path.slice(1),
    });
  });
  return view_workspaces;
}

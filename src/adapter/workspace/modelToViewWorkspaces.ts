import { ModelWorkspace } from "../../model/workspace";
import { ViewWorkspace } from "../../view/datatypes";

// Converts the map of ModelWorkspace's to ViewWorkspaces.
export default function modelToViewWorkspaces(
  workspaces: Map<string, ModelWorkspace>
): ViewWorkspace[] {
  let view_workspaces: ViewWorkspace[] = [];
  workspaces.forEach((ws) => {
    view_workspaces.push({
      name: ws.path.slice(1),
    });
  });
  return view_workspaces;
}

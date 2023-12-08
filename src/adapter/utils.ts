import { ChannelInterface, WorkspaceInterface } from "../interfaces";
import { slog } from "../slog";
import { ViewChannel, ViewWorkspace } from "../view/datatypes";

/**
 * Converts the map of ModelChannels to an array of ViewChannels
 */
export function modelToViewChannels(
  modelChannels: Map<string, ChannelInterface>,
) {
  let viewChannelArr = new Array<ViewChannel>();
  modelChannels.forEach((modelChannel) => {
    slog.info("displayViewChannels", [
      "viewChannel name",
      modelChannel.getName(),
    ]);
    viewChannelArr.push({
      name: modelChannel.getName(),
    });
  });
  return viewChannelArr;
}

/**
 * Converts ModelWorkspaces to ViewWorkspaces
 * @param workspaces The map of workspaces to convert.
 */
export function modelToViewWorkspaces(
  workspaces: Map<string, WorkspaceInterface>,
): ViewWorkspace[] {
  let view_workspaces: ViewWorkspace[] = [];
  workspaces.forEach((ws) => {
    view_workspaces.push({
      name: ws.getName(),
    });
  });
  return view_workspaces;
}

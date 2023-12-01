import { getModel } from "../../model/model";
import { getView } from "../../view/view";
import modelToViewWorkspaces from "./modelToViewWorkspaces";

export default async function refreshWorkspaces(evt: Event) {
  const workspaces = await getModel().getAllWorkspaces();
  getView().displayWorkspaces({
    allWorkspaces: modelToViewWorkspaces(workspaces),
    op: "replace",
    affectedWorkspaces: modelToViewWorkspaces(workspaces),
    cause: evt,
  });
}

import { getModel } from "../../model/model";
import { LoginEvent, ViewWorkspace } from "../../view/datatypes";
import { getView } from "../../view/view";
import modelToViewWorkspaces from "../workspace/modelToViewWorkspaces";

export function initLogin() {
  // TODO: Need something to switch to the chatPage
  document.addEventListener("loginEvent", (event: CustomEvent<LoginEvent>) => {
    let model = getModel();
    let view = getView();
    model.login(event.detail.username).then((userInfo) => {
      view.displayUser({
        username: event.detail.username,
      });
      // When we log in, we need to fetch the open workspaces as well so that the view can display them.
      model.getAllWorkspaces().then((workspaces) => {
        view.displayWorkspaces(modelToViewWorkspaces(workspaces));
      });
    });
  });
}

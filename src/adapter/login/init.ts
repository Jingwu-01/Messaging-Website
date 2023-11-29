import { getModel } from "../../model/model";
import { LoginEvent } from "../../view/datatypes";
import { getView } from "../../view/view";
import modelToViewWorkspaces from "../workspace/modelToViewWorkspaces";

/* Sets up a mechanism to handle user login events. It first logs in with the given username and displays it. After logging in, it also fetches and displays open workspaces. */
export function initLogin() {
  // Add an event listener to the LoginEvent
  document.addEventListener("loginEvent", (event: CustomEvent<LoginEvent>) => {
    let model = getModel();
    let view = getView();

    // Log in with the input username and then display it
    model.login(event.detail.username).then((userInfo) => {
      view.displayUser({
        username: event.detail.username,
      });

      // Fetch and then display the open workspaces
      model.getAllWorkspaces().then((workspaces) => {
        view.displayWorkspaces({
          allWorkspaces: modelToViewWorkspaces(workspaces),
          op: "replace",
          affectedWorkspaces: modelToViewWorkspaces(workspaces),
          cause: event,
        });
      });
    });
  });
}

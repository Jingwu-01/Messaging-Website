import { getModel } from "../../model/model";
import { LoginEvent } from "../../view/datatypes";
import { getView } from "../../view/view";
import refreshWorkspaces from "../workspace/refreshWorkspaces";

/* Sets up a mechanism to handle user login events. It first logs in with the given username and displays it. After logging in, it also fetches and displays open workspaces. */
export function initLogin() {
  // Add an event listener to the LoginEvent
  document.addEventListener(
    "loginEvent",
    async (event: CustomEvent<LoginEvent>) => {
      let model = getModel();
      let view = getView();

      try {
        // Log in with the input username and then display it
        await model.login(event.detail.username);
      } catch (err) {
        getView().displayError("Failed to log in");
      }

      view.displayUser({
        username: event.detail.username,
      });

      // Display the open workspaces.
      await refreshWorkspaces(event);
      getView().completeEvent(event);
    },
  );
}

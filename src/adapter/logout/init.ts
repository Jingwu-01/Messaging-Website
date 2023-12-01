import { getModel } from "../../model/model";
import { getView } from "../../view/view";
import { LogoutEvent } from "../../view/datatypes";

/* Sets up a mechanism to handle user logout events. It logs out the current user, and then reset to the HomePage which asks the user to login again. */
export function initLogout() {
  document.addEventListener(
    "logoutEvent",
    (event: CustomEvent<LogoutEvent>) => {
      let model = getModel();
      let view = getView();
      // Log out the current user and reset to the HomePage that requires login.
      model.logout().then(() => {
        view.displayUser(null);
      });
    },
  );
}

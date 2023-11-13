import { getModel } from "../../model/model";
import { getView } from "../../view/view";
import { LogoutEvent } from "../../view/datatypes";

export function initLogout() {
  document.addEventListener(
    "logoutEvent",
    (event: CustomEvent<LogoutEvent>) => {
      let model = getModel();
      let view = getView();
      model.logout().then(() => {
        view.setHomePage();
      });
    }
  );
}

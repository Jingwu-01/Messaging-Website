import { getModel } from "../../model/model";
import { LoginEvent } from "../../view/datatypes";
import { getView } from "../../view/view";

export function initLogin() {
  // TODO: Need something to switch to the chatPage
  document.addEventListener("loginEvent", (event: CustomEvent<LoginEvent>) => {
    let model = getModel();
    let view = getView();
    model.login(event.detail.username).then((userInfo) => {
      window.location.hash = "#/chat";
      view.displayUser({
        username: event.detail.username,
      });
    });
  });
}

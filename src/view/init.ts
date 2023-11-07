import popoverComponentInit from "./components/pieces/popoverComponent/init";
import menuComponentInit from "./components/pieces/menuComponent/init";
import userMenuComponentInit from "./components/pages/chatPage/appBarComponent/userMenuComponent/init";
import appBarComponentInit from "./components/pages/chatPage/appBarComponent/init";
import workspaceMenuComponentInit from "./components/pages/chatPage/appBarComponent/workspaceMenuComponent/init";

export function initView() {
  popoverComponentInit();
  menuComponentInit();
  userMenuComponentInit();
  appBarComponentInit();
  workspaceMenuComponentInit();
}

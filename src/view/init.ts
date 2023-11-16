import popoverComponentInit from "./components/pieces/popoverComponent/init";
import menuComponentInit from "./components/pieces/menuComponent/init";
import userMenuComponentInit from "./components/pages/chatPage/appBarComponent/userMenuComponent/init";
import appBarComponentInit from "./components/pages/chatPage/appBarComponent/init";
import workspaceMenuComponentInit from "./components/pages/chatPage/appBarComponent/workspaceMenuComponent/init";
import m3ssagin8AppComponentInit from "./components/pages/m3ssagin8AppComponent/init";
import chatPageInit from "./components/pages/chatPage/init";
import postDisplayComponentInit from "./components/pages/chatPage/postDisplayComponent/init";
import postComponentInit from "./components/pages/chatPage/postComponent/init";
import homePageInit from "./components/pages/homePage/init";
import channelSidebarComponentInit from "./components/pages/chatPage/channelSidebarComponent/init";
import postEditorInit from "./components/pages/chatPage/postEditorComponent/init";
import hoverComponentInit from "./components/pieces/hoverComponent/init";
import editDialogComponentInit from "./components/pages/chatPage/editDialog/init";

export function initView() {
  popoverComponentInit();
  menuComponentInit();
  userMenuComponentInit();
  appBarComponentInit();
  workspaceMenuComponentInit();
  m3ssagin8AppComponentInit();
  chatPageInit();
  postDisplayComponentInit();
  postComponentInit();
  homePageInit();
  hoverComponentInit();
  channelSidebarComponentInit();
  postEditorInit();
  editDialogComponentInit();
}

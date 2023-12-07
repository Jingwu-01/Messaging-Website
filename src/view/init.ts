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
import { openDialogButtonComponentInit } from "./components/pieces/openDialogButtonComponent/init";
import replyButtonComponentInit from "./components/pieces/replyButtonComponent/init";
import reactionComponentInit from "./components/pieces/reactionComponent/init";
import loadingButtonComponentInit from "./components/pieces/loadingButtonComponent/init";
import snackbarInit from "./components/pieces/snackbarComponent/init";
import { getView } from "./view";
import snackbarDisplayInit from "./components/pieces/snackbarDisplayComponent/init";
import starButtonInit from "./components/pieces/starButtonComponent/init";
import starredPostsComponentInit from "./components/pages/chatPage/starredPostsComponent/init";

/**
 * Called when main.ts initializes the view. Used for setup all the web components.
 */
export function initView() {
  // Initialize / register components.
  reactionComponentInit();
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
  openDialogButtonComponentInit();
  replyButtonComponentInit();
  loadingButtonComponentInit();
  snackbarInit();
  snackbarDisplayInit();
  starButtonInit();
  starredPostsComponentInit();

  // Open the login dialog on page load.
  getView().openDialog("login-dialog");
}

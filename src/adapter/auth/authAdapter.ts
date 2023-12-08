import {
  ModelInterface,
  StateManagerInterface,
  ViewInterface,
} from "../../interfaces";
import { LoginEvent, LogoutEvent } from "../../view/datatypes";
import { modelToViewWorkspaces } from "../utils";

export class AuthAdapter {
  private view: ViewInterface;
  private model: ModelInterface;
  private stateManager: StateManagerInterface;

  constructor(
    view: ViewInterface,
    model: ModelInterface,
    stateManager: StateManagerInterface
  ) {
    this.view = view;
    this.model = model;
    this.stateManager = stateManager;
  }

  getView(): ViewInterface {
    return this.view;
  }

  getModel(): ModelInterface {
    return this.model;
  }

  getStateManager(): StateManagerInterface {
    return this.stateManager;
  }

  async login(event: CustomEvent<LoginEvent>) {
    let model = this.getModel();
    let view = this.getView();
    let stateManager = this.getStateManager();
    view.setStateLoadingUntil(["user"], event);
    try {
      // Log in with the input username and then display it
      await model.login(event.detail.username);
      stateManager.setLoggedInUser(event.detail.username);
    } catch (err) {
      this.getView().failEvent(event, "Failed to log in");
      return;
    }

    view.displayUser({
      username: event.detail.username,
    });

    // Display the open workspaces.
    try {
      await this.refreshWorkspaces(event);
    } catch (error) {
      this.getView().failEvent(event, "Failed to refresh workspaces");
      return;
    }
    this.getView().completeEvent(event);
  }

  async logout(event: CustomEvent<LogoutEvent>) {
    let model = this.getModel();
    let view = this.getView();
    let stateManager = this.getStateManager();
    view.setStateLoadingUntil(["user"], event);
    // Log out the current user and reset to the HomePage that requires login.
    model
      .logout()
      .then(() => {
        view.displayUser(null);
        stateManager.setLoggedInUser(null);
        view.completeEvent(event);
      })
      .catch(() => {
        view.failEvent(event, "Failed to log out");
      });
  }

  async refreshWorkspaces(event: Event) {
    const workspaces = await this.getModel().getAllWorkspaces();
    // If the open workspace doesn't exist anymore, then close the open workspace.
    let open_workspace_name = this.getStateManager()
      .getOpenWorkspace()
      ?.getName();
    if (open_workspace_name && !workspaces.has(open_workspace_name)) {
      this.getStateManager().setOpenWorkspace(null);
      this.getView().displayChannels({
        allChannels: [],
        op: "replace",
        affectedChannels: [],
      });
    }
    this.getView().displayWorkspaces({
      allWorkspaces: modelToViewWorkspaces(workspaces),
      op: "replace",
      affectedWorkspaces: modelToViewWorkspaces(workspaces),
    });
  }

  initAuth() {
    document.addEventListener("loginEvent", this.login.bind(this));

    document.addEventListener("logoutEvent", this.logout.bind(this));
  }
}

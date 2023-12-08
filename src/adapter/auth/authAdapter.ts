import {
  ModelInterface,
  StateManagerInterface,
  ViewInterface,
} from "../../interfaces";
import { LoginEvent, LogoutEvent } from "../../view/datatypes";
import { modelToViewWorkspaces } from "../utils";

/**
 * This adapter handles login and logout events from the view, and updates the username in the state
 * manager accordingly. It then updates what's displayed in the view accordingly.
 */
export class AuthAdapter {
  // References the view interface to update.
  private view: ViewInterface;
  // References the model interface to update.
  private model: ModelInterface;
  // References the state manager interface to update.
  private stateManager: StateManagerInterface;

  /**
   * Creates an authentication adapter by injecting a view, model, and state manager interface.
   * @param view the view interface to display updated changes
   * @param model the model interface which this adapter makes requests to
   * @param stateManager the state manager interface which this adapter stores information in
   */
  constructor(
    view: ViewInterface,
    model: ModelInterface,
    stateManager: StateManagerInterface,
  ) {
    this.view = view;
    this.model = model;
    this.stateManager = stateManager;
  }

  /**
   * Returns the View interface that this adapter calls.
   * @returns a ViewInterface to be called
   */
  getView(): ViewInterface {
    return this.view;
  }

  /**
   * Returns the Model interface that this adapter calls.
   * @returns a ModelInterface to be called
   */
  getModel(): ModelInterface {
    return this.model;
  }

  /**
   * Returns the StateManager interface that this adapter calls.
   * @returns a StateManagerInterface to be called
   */
  getStateManager(): StateManagerInterface {
    return this.stateManager;
  }

  /**
   * Receives a login event, and makes a request to the model to login the user
   * with the specified username.
   * @param event a CustomEvent containing the user's username
   * @returns nothing (waits for a response from the model, and sets the logged in user in the
   * state manager)
   */
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

  /**
   * Receives a logout event from the user, and makes a request to the user to log
   * the user out. Clears the displayed workspace and nulls the username.
   * @param event a CustomEvent containing a LogoutEvent, indicating that the user wants to log out.
   */
  async logout(event: CustomEvent<LogoutEvent>) {
    let model = this.getModel();
    let view = this.getView();
    let stateManager = this.getStateManager();
    view.setStateLoadingUntil(
      ["user", "channels", "workspaces", "posts"],
      event,
    );
    // Log out the current user and reset to the HomePage that requires login.
    model
      .logout()
      .then(() => {
        view.displayUser(null);
        stateManager.setLoggedInUser(null);
        stateManager.setOpenWorkspace(null);
        view.completeEvent(event);
      })
      .catch(() => {
        view.failEvent(event, "Failed to log out");
      });
  }

  /**
   * Makes a request to the model to re-fetch all workspaces. Clears the currently displayed workspace and
   * channels. Also, tells the view to display all the new workspaces.
   * @param event any event received by the user
   */
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

  /**
   * Initializes the event handlers for login and logout events, which this adapter listens for.
   */
  initAuth() {
    document.addEventListener("loginEvent", this.login.bind(this));

    document.addEventListener("logoutEvent", this.logout.bind(this));
  }
}

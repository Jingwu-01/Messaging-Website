import { PostsManager } from "./postsManager";
import { PostResponse } from "../../types/postResponse";
import { ChannelInterface, ModelInterface, ViewInterface, WorkspaceInterface } from "../interfaces";

/**
 * The state manager stores the state of the application
 * and has functions that the adapter can call to manipulate that state.
 * It interfaces with the Model, and has functions that are called by the Adapter.
 */
export class StateManager {
  private openWorkspace: WorkspaceInterface | null = null;

  private openChannel: ChannelInterface | null = null;

  private postsManager: PostsManager;

  private loggedInUser: string | null = null;

  private view: ViewInterface;

  private model: ModelInterface;

  constructor(view: ViewInterface, model: ModelInterface) {
    this.view = view;
    this.model = model;
    this.postsManager = new PostsManager(view, this);
  }

  /**
   * Gets the currently open workspace
   * @returns a ModelWorkspace if it's open, or null if no workspace is open.
   */
  getOpenWorkspace(): WorkspaceInterface | null {
    return this.openWorkspace;
  }

  /**
   * Sets the open workspace to be the workspace with the specified name.
   * @param workspaceName a string representing the name of the workspace to set.
   * @returns a Promise resolving to the newly set ModelWorkspace, or null if a model workspace was
   * not able to be set.
   */
  async setOpenWorkspace(
    workspaceName: string | null
  ): Promise<WorkspaceInterface | null> {
    // Close workspace if we passed a null.
    if (workspaceName == null) {
      this.openWorkspace = null;
      await this.setOpenChannel(null);
      this.getView().displayOpenWorkspace(null);
      return null;
    }
    // Don't do anything if it's the same workspace.
    if (this.openWorkspace?.getName() === workspaceName) {
      return this.openWorkspace;
    }
    this.openWorkspace = await this.getModel().getWorkspace(workspaceName);
    // Un-select the open channel.
    await this.setOpenChannel(null);
    // Display the new open workspace.
    this.getView().displayOpenWorkspace({
      name: this.openWorkspace.getName(),
    });
    return this.openWorkspace;
  }

  /**
   * Gets the application's currently open channel
   * @returns The currently open channel, or null if no channel is open.
   */
  getOpenChannel(): ChannelInterface | null {
    return this.openChannel;
  }

  /**
   * Sets the open channel to channelName. Updates the view.
   * @param channelName The channel to open
   * @returns A promise that resolves to the new open channel
   */
  async setOpenChannel(
    channelName: string | null
  ): Promise<ChannelInterface | null> {
    // Unsub from old channel
    if (this.openChannel != null) {
      this.openChannel.unsubscribe();
      this.resetPostsManager();
    }
    if (channelName == null) {
      this.openChannel = null;
      this.getView().displayOpenChannel(null);
      this.getView().removePostDisplay();
      return null;
    }
    let ws = this.getOpenWorkspace();
    if (ws != null) {
      this.openChannel = await ws.getChannel(channelName);
      this.openChannel.subscribeToPosts();
      this.getView().displayOpenChannel({
        name: this.openChannel.getName(),
      });
      this.getView().displayPostDisplay();
      return this.openChannel;
    } else {
      throw new Error("Cannot get open channel: no open workspace");
    }
  }

  /**
   * @returns The name of the currently open workspace, or null if there is none.
   */
  getOpenWorkspaceName() {
    return this.openWorkspace?.getName();
  }
  /**
   * @returns The name of the currently open workspace, or null if there is none.
   */
  getOpenChannelName() {
    return this.openChannel?.getName();
  }

  /**
   * Serializes the PostResponse.
   */
  serializePostResponse(response: PostResponse) {
    return this.postsManager.serializePostResponse(response);
  }

  /**
   * Resets the posts manager
   */
  resetPostsManager() {
    this.postsManager = new PostsManager(this.getView(), this);
  }

  /**
   * Sets the logged-in user to username. Does not affect the model.
   * @param username The username of the
   */
  setLoggedInUser(username: string | null) {
    this.loggedInUser = username;
  }

  /**
   * Gets the logged-in user's username
   * @returns The username of the logged-in user
   */
  getLoggedInUser(): string | null {
    return this.loggedInUser;
  }

  /**
   * Returns the view that this state manager updates.
   * @returns the view interface that this state manager updates.
   */
  getView() {
    return this.view;
  }
  
  /**
   * Returns the model that this state manager requests information from.
   * @returns the model interface that this state manager requests information from.
   */
  getModel() {
    return this.model;
  }
}

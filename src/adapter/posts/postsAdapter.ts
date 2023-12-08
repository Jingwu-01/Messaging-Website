import {
  ModelInterface,
  StateManagerInterface,
  ViewInterface,
} from "../../interfaces";
import { ModelPostEvent, ModelReactionUpdate } from "../../model/modelTypes";
import { slog } from "../../slog";
import {
  CreatePostEvent,
  EventWithId,
  ReactionUpdateEvent,
} from "../../view/datatypes";

/**
 * This adapter handles post update events from the view as well as handles post update
 * events received by the model. It updates the view with three pieces of information:
 * (1) the content of the post to update, (2) the index of the updated post, and (3) the post's
 * parent. It makes requests to the model to send post updates, and updates the state manager accordingly
 * to store the updated posts.
 */
export class PostsAdapter {
  // References the view interface which displays updated post changes.
  private view: ViewInterface;
  // References the model interface which this adapter makes requests to.
  private model: ModelInterface;
  // References the state manager interface which this adapter stores information in.
  private stateManager: StateManagerInterface;
  // A set of events which are waiting for an updated post to come back, which will trigger the
  // view to display a corresponding message.
  private eventsWaitingOnPostUpdate: Set<EventWithId> = new Set<EventWithId>();

  /**
   * Creates a channels adapter by injecting a view, model, and state manager interface.
   * @param view the view interface to display updated changes
   * @param model the model interface which this adapter makes requests to
   * @param stateManager the state manager interface which this adapter stores information in
   */
  constructor(
    view: ViewInterface,
    model: ModelInterface,
    stateManager: StateManagerInterface
  ) {
    this.view = view;
    this.model = model;
    this.stateManager = stateManager;
  }

  /**
   * Returns a view interface which this adapter updates.
   * @returns a ViewInterface to receive updates in the view
   */
  getView(): ViewInterface {
    return this.view;
  }

  /**
   * Returns a model interface which this adapter makes requests to for data.
   * @returns a ModelInterface which this adapter makes requests to
   */
  getModel(): ModelInterface {
    return this.model;
  }

  /**
   * Returns a state manager interface which this adapter stores and retrieves data from.
   * @returns a StateManagerInterface storing data
   */
  getStateManager(): StateManagerInterface {
    return this.stateManager;
  }

  /**
   * Receives an event from the view that a post is created. Makes a request to the model to create the post,
   * and notifies the view if an error occurred.
   * @param evt an event encapsulating the message to add, as well as the parent post this new post
   * is replying to.
   */
  async createPostEvent(evt: CustomEvent<CreatePostEvent>) {
    this.getView().setStateLoadingUntil(["posts"], evt);
    slog.info("createPostEvent handler", [
      "create post event",
      `${JSON.stringify(evt.detail)}`,
    ]);
    this.eventsWaitingOnPostUpdate.add(evt);
    try {
      await this.createPost(evt.detail);
    } catch (err) {
      this.eventsWaitingOnPostUpdate.delete(evt);
      this.getView().failEvent(evt, "Failed to create post");
    }
  }

  /**
   * Makes a request to the model to create a post with the message and parent.
   * @param postData an event encapsulating the message as well as the parent of the new post to be added.
   * @returns a Promise encapsulating the response from the model of whether or not the post
   * was successfully added.
   */
  createPost(postData: CreatePostEvent) {
    // Get the open channel from the view to make the request.
    let channel = this.getStateManager().getOpenChannel();
    // This error occurs when a post is added and the view has not displayed an open channel.
    if (channel === null) {
      throw new Error("Cannot add a post: no open channel");
    }

    // Make the creation request, displaying an error on the view if the request failed.
    return channel
      .createPost(postData.msg, postData.parent, channel.path)
      .then(() => {
        slog.info("createPost: added to the database");
      });
  }

  /**
   * Makes a request to the model to update the reaction for the specified post
   * for the specified user. Updates the state manager with the reacted post,
   * and displays an error on the view upon failure.
   * @param event an event encapsulating the name of the reaction, the path of the post
   * which is reacted to, and the name of the user who reacted to this post.
   */
  async updateReaction(event: CustomEvent<ReactionUpdateEvent>) {
    this.getView().setStateLoadingUntil(["posts"], event);
    let model = this.getModel();
    let modelUpdate: ModelReactionUpdate = {
      reactionName: event.detail.reactionName,
      userName: event.detail.userName,
      postPath: event.detail.postPath,
      add: event.detail.add,
    };
    try {
      this.eventsWaitingOnPostUpdate.add(event);
      const response = await model.updateReaction(modelUpdate);
      slog.info("reactionUpdateEvent listener", [
        "update reaction request went through",
        `${JSON.stringify(response)}`,
      ]);
      if (response.patchFailed) {
        this.eventsWaitingOnPostUpdate.delete(event);
        this.getView().failEvent(event, "error displaying reactions");
      }
    } catch (error) {
      this.eventsWaitingOnPostUpdate.delete(event);
      slog.error("reactionUpdateEvent listener", [
        "error from model.updateReaction",
        `${JSON.stringify(error)}`,
      ]);
      this.getView().failEvent(event, "error displaying reactions");
    }
  }

  /**
   * Receives post data from the model, and updates the state manager accordingly with this
   * new post. Either updates the view with the new post, or displays an error accordingly.
   * @param evt an event encapuslating the post JSON object received by the model
   * @returns nothing (updates the view with the new post, or displays an error accordingly)
   */
  modelPostUpdate(evt: CustomEvent<ModelPostEvent>) {
    slog.info("modelPostEvent listener: received modelPostEvent", [
      "modelPostEvent.detail",
      evt.detail,
    ]);
    // Render the post
    let [success, message] = this.getStateManager().serializePostResponse(
      evt.detail.post
    );
    // After everything is rendered, check if this event was the result of an
    // action taken by our user.
    if (
      evt.detail.post.meta.lastModifiedBy ===
      this.getStateManager().getLoggedInUser()
    ) {
      console.log("reaction updated!");
      this.eventsWaitingOnPostUpdate.forEach((evt) => {
        if (!success) {
          this.getView().failEvent(evt, message);
        } else {
          this.getView().completeEvent(evt);
        }
      });
      this.eventsWaitingOnPostUpdate = new Set<EventWithId>();
      return;
    }
    // If this was just a random post (not from the user) and the request failed, then display the error.
    if (!success) {
      this.getView().displayError(message);
    }
  }

  /**
   * Initializes event listeners for creation and update events from the view, as well as
   * update events from the model.
   */
  initPosts() {
    document.addEventListener(
      "createPostEvent",
      this.createPostEvent.bind(this)
    );

    /**
     * Handles events for reaction updates.
     */
    document.addEventListener(
      "reactionUpdateEvent",
      this.updateReaction.bind(this)
    );

    /**
     * Handles new model posts from the model.
     */
    document.addEventListener(
      "modelPostEvent",
      this.modelPostUpdate.bind(this)
    );
  }
}

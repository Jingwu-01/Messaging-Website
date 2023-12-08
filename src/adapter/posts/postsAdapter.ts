import { ModelInterface, StateManagerInterface, ViewInterface } from "../../interfaces";
import { ModelPostEvent, ModelReactionUpdate } from "../../model/modelTypes";
import { slog } from "../../slog";
import { CreatePostEvent, EventWithId, ReactionUpdateEvent } from "../../view/datatypes";

export class PostsAdapter {
    private view: ViewInterface;
    private model: ModelInterface;
    private stateManager: StateManagerInterface;

    private eventsWaitingOnPostUpdate: Set<EventWithId> = new Set<EventWithId>();

    constructor(view: ViewInterface, model: ModelInterface, stateManager: StateManagerInterface) {
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

    async createPostEvent(evt: CustomEvent<CreatePostEvent>) {
        this.getView().setStateLoadingUntil(
            ["channels", "posts", "user", "workspaces"],
            evt
          );
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

    async updateReaction(event: CustomEvent<ReactionUpdateEvent>) {
        this.getView().setStateLoadingUntil(
            ["channels", "posts", "user", "workspaces"],
            event
          );
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

    initPosts() {
        document.addEventListener("createPostEvent", 
        this.createPostEvent.bind(this));

        /**
         * Handles events for reaction updates.
         */
        document.addEventListener("reactionUpdateEvent",
        this.updateReaction.bind(this));

        /**
         * Handles new model posts from the model.
         */
        document.addEventListener("modelPostEvent",
        this.modelPostUpdate.bind(this));
    }

}
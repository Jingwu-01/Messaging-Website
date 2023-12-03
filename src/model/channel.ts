/**
 * A class encapsulating logic for channels stored in the model.
 */

import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ModelPost } from "./post";
import { CreateResponse } from "../../types/createResponse";
import { getDatabasePath, validatePostResponse } from "./utils";
import { getModel } from "./model";
import { slog } from "../slog";
import { PostResponse } from "../../types/postResponse";
import { ChannelResponse } from "../../types/channelResponse";

/**
 * A data representation of a channel in the model. Allows us to control connection requests related to specific channels.
 */
export class ModelChannel {
  // The path corresponding to this channel
  path: string;

  // A map containing all of our model posts.
  private postMap: Map<string, ModelPost> = new Map<string, ModelPost>();

  // A map containing the roots for the posts.
  private postRoots: Map<string, ModelPost> = new Map<string, ModelPost>();

  // A map of post names to an array of model posts for which the posts are pending.
  private pendingPosts: Map<string, Array<ModelPost>> = new Map<
    string,
    Array<ModelPost>
  >();

  // A controller for cancelling subscription connections.
  private controller = new AbortController();

  constructor(res: ChannelResponse) {
    this.path = res.path;
  }

  /**
   * Subscribes to all posts in a particular channel.
   */
  subscribeToPosts(): void {
    let thisChannel = this;
    const options = {
      Authorization: "Bearer " + getModel().getToken(),
      accept: "application/json",
    };
    // TODO: can make this more elegant by making modelFetch take in a fetch function which it uses
    let fetchUrl = getDatabasePath() + `${this.path}/posts/?mode=subscribe`;
    slog.info("subscribeToPosts", ["fetchUrl", `${fetchUrl}`]);
    fetchEventSource(fetchUrl, {
      headers: options,
      // TODO: I am SURE that you can theoretically have some extra
      // error handling here too, for impossible events.
      onmessage(event) {
        switch (event.event) {
          // When we receive a new post, add it to our internal array
          // and send an event with all the posts.
          case "update":
            slog.info("subscribeToPosts", ["event.data", event.data]);
            const response = JSON.parse(event.data) as PostResponse;
            const valid = validatePostResponse(response);
            if (!valid) {
              slog.error("subscribeToPosts", [
                "invalid post data",
                `${JSON.stringify(validatePostResponse.errors)}`,
              ]);
            } else {
              // slog.info("subscribeToPosts", ["event.data", `${JSON.stringify(event.data)}`]);
              slog.info("update event for post", [
                "incoming post",
                JSON.stringify(response),
              ]);
              // thisChannel.addPost(response);
              const modelPostEvent = new CustomEvent("modelPostEvent", {
                detail: { post: response },
              });
              document.dispatchEvent(modelPostEvent);
              slog.info(
                "subscribeToPosts",
                ["thisChannel.postMap", `${thisChannel.postMap}`],
                ["thisChannel.postRoots", `${thisChannel.postRoots}`],
              );
              // const postsEvent = new CustomEvent("postsEvent", {
              //   // NOTE: we are passing by reference here. so mutations will be seen.
              //   // however, with kill and fill and queueing of events, this may not be an issue
              //   detail: { postRoots: thisChannel.postRoots },
              // });
              // document.dispatchEvent(postsEvent);
              // TODO: does TS use these 'break' statements
              // like are conventionally used?
            }
            break;
          case "delete":
            // placeholder
            throw new Error("Posts cannot be deleted");
        }
      },

      signal: this.controller.signal,
    });
  }

  /**
   * Adds a ModelPost to this channel.
   * @param newPostResponse a JSON object representing the response from the post event.
   * @returns a boolean representing whether or not the post was successfully added to the model.
   */
  addPost(newPostResponse: PostResponse): Boolean {
    console.log("addPost: was called");
    let newPost = new ModelPost(newPostResponse);
    let parentPath = newPostResponse.doc.parent;
    console.log(`addPost: parentPath: ${parentPath}`);
    let postName = newPostResponse.path.split("/").pop();
    if (postName === undefined) {
      throw Error(
        "addPost: internal server error: post has an empty path string",
      );
    }
    if (this.postMap.get(postName) !== undefined) {
      this.postMap.set(postName, newPost);
      if (this.postRoots.get(postName) !== undefined) {
        this.postRoots.set(postName, newPost);
      }
    }
    console.log(`addPost: postName: ${postName}`);
    if (parentPath === "" || parentPath === undefined) {
      this.postRoots.set(postName, newPost);
      this.postMap.set(postName, newPost);
      let modelPostEvent = new CustomEvent("modelPostEvent", {
        detail: { post: newPost },
      });
      slog.info("addPost: root post event", ["modelPostEvent", modelPostEvent]);
      document.dispatchEvent(modelPostEvent);
      this.addPendingPosts(postName, newPost);
      return true;
    }
    let parentPathArr = parentPath.split("/");
    // TODO: use the workspace name and the currently open channel name
    // to validate against what's the WS and curr open channel
    if (parentPathArr.length !== 6) {
      console.log(
        "addPost: invalid parentPathArr: parentPathArr is not of length 6",
      );
      return false;
    }
    // let workspaceName = parentPathArr[1];
    // let channelName = parentPathArr[3];

    let parentName = parentPathArr.pop();
    if (parentName === undefined) {
      slog.error("addPost", [
        "internal server error",
        "parentName is undefined, but this should be impossible",
      ]);
      return false;
    }
    console.log(`addPost: parentName: ${parentName}`);
    let parentPost = this.postMap.get(parentName);
    if (parentPost === undefined) {
      slog.info(
        "addPost",
        ["parentPost is undefined", ""],
        ["parentName", `${parentName}`],
        ["this.postMap", `${JSON.stringify(Object.fromEntries(this.postMap))}`],
      );
      let parentPendingPosts = this.pendingPosts.get(parentName);
      if (parentPendingPosts === undefined) {
        parentPendingPosts = new Array<ModelPost>();
      }
      parentPendingPosts.push(newPost);
      this.pendingPosts.set(parentName, parentPendingPosts);
      return false;
    }
    if (parentPost.addChildPost(newPost)) {
      this.postMap.set(postName, newPost);
      let modelPostEvent = new CustomEvent("modelPostEvent", {
        detail: { post: newPost },
      });
      slog.info("addPost: child post event", [
        "modelPostEvent",
        modelPostEvent,
      ]);
      document.dispatchEvent(modelPostEvent);
      this.addPendingPosts(postName, newPost);
    }
    return true;
  }

  /**
   * Adds all pending posts for this particular post that was added.
   * @param addedPostName a string representing the name of the post that was added
   * @param addedPost a ModelPost object representing the ModelPost that was added
   * @returns nothing
   */
  addPendingPosts(addedPostName: string, addedPost: ModelPost): void {
    slog.info(
      "addPendingPosts: called",
      ["addedPostName", addedPostName],
      ["addedPost", addedPost],
    );
    let parentPendingPosts = this.pendingPosts.get(addedPostName);
    if (parentPendingPosts === undefined) {
      return;
    }
    parentPendingPosts.forEach((pendingPost: ModelPost) => {
      addedPost.addChildPost(pendingPost);
      this.postMap.set(pendingPost.getName(), pendingPost);
      let modelPostEvent = new CustomEvent("modelPostEvent", {
        detail: { post: pendingPost },
      });
      slog.info("addPost: pending post event", [
        "modelPostEvent",
        modelPostEvent,
      ]);
      document.dispatchEvent(modelPostEvent);
      this.addPendingPosts(pendingPost.getName(), pendingPost);
    });
    this.pendingPosts.delete(addedPostName);
  }

  createPost(
    postContent: string,
    postParent: string,
    channelPath: string,
  ): Promise<CreateResponse> {
    // for now, this return type is indeed ignored. because i update from the subscription always.
    return getModel().typedModelFetch<CreateResponse>(`${channelPath}/posts/`, {
      method: "POST",
      body: JSON.stringify({
        msg: postContent,
        parent: postParent,
      }),
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  unsubscribe() {
    this.controller.abort();
    this.controller = new AbortController();
  }

  getName() {
    return this.path.split("/")[3];
  }
}

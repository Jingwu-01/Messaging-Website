import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ModelPost } from "./post";
import { ChannelResponse, PostResponse } from "./responseTypes";
import { getDatabasePath } from "./utils";
import { getModel } from "./model";
import { slog } from "../slog";

export class ModelChannel {
  path: string;

  private postRoots: Map<string, ModelPost>;

  private controller = new AbortController();

  constructor(res: ChannelResponse) {
    this.path = res.path;
    this.postRoots = new Map<string, ModelPost>();
  }

  // Subscribes to all posts in a particular workspace and collection.
  subscribeToPosts(): void {
    // TODO: is there a better way to do this? bind isn't working
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
            const jsonContents = JSON.parse(event.data) as PostResponse;
            slog.info("update event for post", ["incoming post", JSON.stringify(jsonContents)]);
            thisChannel.addPost(jsonContents);
            console.log(
              `subscribeToPosts: thisChannel.posts: ${JSON.stringify(
                thisChannel.postRoots
              )}`
            );
            const postsEvent = new CustomEvent("postsEvent", {
              // NOTE: we are passing by reference here. so mutations will be seen.
              // however, with kill and fill and queueing of events, this may not be an issue
              detail: { posts: thisChannel.postRoots },
            });
            document.dispatchEvent(postsEvent);
            // TODO: does TS use these 'break' statements
            // like are conventionally used?
            break;
          case "delete":
            // placeholder
            throw new Error("Posts cannot be deleted");
        }
      },

      signal: this.controller.signal,
    });
  }

  addPost(newPostResponse: PostResponse): Boolean {
    console.log("addPost: was called");
    let newPost = new ModelPost(newPostResponse);
    let parentPath = newPostResponse.doc.parent;
    console.log(`addPost: parentPath: ${parentPath}`);
    let postName = newPostResponse.path.split("/").pop();
    if (postName === undefined) {
      throw Error(
        "addPost: internal server error: post has an empty path string"
      );
    }
    console.log(`addPost: postName: ${postName}`);
    if (parentPath === "" || parentPath === undefined) {
      this.postRoots.set(postName, newPost);
      return true;
    }
    let parentPathArr = parentPath.split("/");
    // TODO: use the workspace name and the currently open channel name
    // to validate against what's the WS and curr open channel
    if (parentPathArr.length < 6) {
      console.log("addPost: invalid parentPathArr: parentPathArr is too short");
      return false;
    }
    // let workspaceName = parentPathArr[1];
    // let channelName = parentPathArr[3];
    let postParentPath = parentPathArr.slice(5);
    console.log(`addPost: postParentPath: ${postParentPath}`);

    let nextChildName = postParentPath[0];
    console.log(`addPost: nextChildName: ${nextChildName}`);
    let nextChild = this.postRoots.get(nextChildName);
    if (nextChild === undefined) {
      console.log(`addPost: invalid path to addPost: ${parentPath}`);
      return false;
    }
    return nextChild.addReply(newPost, postParentPath.slice(1));
  }

  unsubscribe() {
    this.controller.abort();
  }
}

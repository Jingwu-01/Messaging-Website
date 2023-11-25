import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ModelPost } from "./post";
import { ChannelResponse, PostDocumentResponse, PostResponse } from "./responseTypes";
import { getDatabasePath } from "./utils";
import { getModel } from "./model";
import { slog } from "../slog";

export class ModelChannel {
  path: string;

  private postMap: Map<string, ModelPost> = new Map<string, ModelPost>();

  private postRoots: Array<ModelPost> = new Array<ModelPost>();

  private pendingPosts: Map<string, Array<ModelPost>> = new Map<string, Array<ModelPost>>();

  private controller = new AbortController();

  constructor(res: ChannelResponse) {
    this.path = res.path;
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
            slog.info("subscribeToPosts", ["thisChannel.postMap", `${thisChannel.postMap}`], ["thisChannel.postRoots", `${thisChannel.postRoots}`]);
            const postsEvent = new CustomEvent("postsEvent", {
              // NOTE: we are passing by reference here. so mutations will be seen.
              // however, with kill and fill and queueing of events, this may not be an issue
              detail: { postRoots: thisChannel.postRoots },
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
      this.postRoots.push(newPost);
      this.postMap.set(postName, newPost);
      this.addPendingPosts(postName, newPost);
      return true;
    }
    let parentPathArr = parentPath.split("/");
    // TODO: use the workspace name and the currently open channel name
    // to validate against what's the WS and curr open channel
    if (parentPathArr.length !== 6) {
      console.log("addPost: invalid parentPathArr: parentPathArr is not of length 6");
      return false;
    }
    // let workspaceName = parentPathArr[1];
    // let channelName = parentPathArr[3];

    let parentName = parentPathArr.pop();
    if (parentName === undefined) {
      slog.error("addPost", ["internal server error", "parentName is undefined, but this should be impossible"]);
      return false;
    }
    console.log(`addPost: parentName: ${parentName}`);
    let parentPost = this.postMap.get(parentName);
    if (parentPost === undefined) {
      slog.info("addPost", ["parentPost is undefined", ""], ["parentName", `${parentName}`], ["this.postMap", `${JSON.stringify(Object.fromEntries(this.postMap))}`]);
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
      this.addPendingPosts(postName, newPost);
    }
    return true;
  }

  addPendingPosts(addedPostName: string, addedPost: ModelPost): void {
    let parentPendingPosts = this.pendingPosts.get(addedPostName);
    if (parentPendingPosts === undefined) {
      return
    }
    parentPendingPosts.forEach((pendingPost: ModelPost) => {
      addedPost.addChildPost(pendingPost);
      this.postMap.set(pendingPost.getName(), pendingPost);
      this.addPendingPosts(pendingPost.getName(), pendingPost);
    });
  }

  createPost(postContent: string, postParent: string, channelPath: string): Promise<PostDocumentResponse> {
    return getModel().typedModelFetch<PostDocumentResponse>(`${channelPath}/posts/`, {
      method: 'POST',
      body: JSON.stringify({
        "msg": postContent,
        "parent": postParent
      }),
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  unsubscribe() {
    this.controller.abort();
  }
}

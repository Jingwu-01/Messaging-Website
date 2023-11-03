import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ModelPost } from "./modelTypes";
import { ChannelResponse } from "./responseTypes";
import { getDatabasePath } from "./utils";

export class ModelChannel {
  path: string;

  private posts: Array<ModelPost>;


  constructor(res: ChannelResponse) {
    this.path = res.path;
    this.posts = [];
    this.addPost.bind(this);
  }

    // Adds a post to our internal array.
  addPost(postContent: string): void {
    // TODO: obviously do some sort of validation here.
    // most likely do this on the receiving end. call a valid. func
    const jsonContents = JSON.parse(postContent) as ModelPost;
    this.posts.push(jsonContents);
  }

  // Subscribes to all posts in a particular workspace and collection.
  subscribeToPosts(workspaceName: string, collectionName: string): void {
    const thisModel = this;
    // TODO: change this to use the actual token (hardcoding it here for testing)
    const options = {
      Authorization: "Bearer " + "-Sw6E.PAQ3RrZcm",
      accept: "application/json"
    }
    let fetchUrl = getDatabasePath() + `/${workspaceName}/channels/${collectionName}/posts/?mode=subscribe`
    fetchEventSource(fetchUrl, {
      headers: options,
      // TODO: I am SURE that you can theoretically have some extra
      // error handling here too, for impossible events.
      onmessage(event) {
        switch (event.event) {
          // When we receive a new post, add it to our internal array
          // and send an event with all the posts.
          case "update":
            thisModel.addPost(event.data);
            const postsEvent = new CustomEvent("postsEvent", {
              detail: {posts: thisModel.posts},
            });
            document.dispatchEvent(postsEvent);
            // TODO: does TS use these 'break' statements
            // like are conventionally used?
            break;
          case "delete":
            // placeholder
            throw new Error("Posts cannot be deleted");
        }
      }
    })
  }
}

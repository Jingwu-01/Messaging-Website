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
  subscribeToPosts(workspaceName: string, collectionName: string, token: string): void {
    // TODO: is there a better way to do this?
    let thisChannel = this;
    const options = {
      Authorization: "Bearer " + token,
      accept: "application/json"
    }
    // TODO: can make this more elegant by making modelFetch take in a fetch function which it uses
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
            thisChannel.addPost(event.data);
            console.log(`subscribeToPosts: thisChannel.posts: ${JSON.stringify(thisChannel.posts)}`)
            const postsEvent = new CustomEvent("postsEvent", {
              // NOTE: we are passing by reference here. so mutations will be seen.
              // however, with kill and fill and queueing of events, this may not be an issue
              detail: {posts: thisChannel.posts},
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

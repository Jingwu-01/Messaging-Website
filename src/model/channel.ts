/**
 * A class encapsulating logic for channels stored in the model.
 */

import { fetchEventSource } from "@microsoft/fetch-event-source";
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

  // A controller for cancelling subscription connections.
  private controller = new AbortController();

  constructor(res: ChannelResponse) {
    this.path = res.path;
  }

  /**
   * Subscribes to all posts in a particular channel.
   */
  subscribeToPosts(): void {
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
              const modelPostEvent = new CustomEvent("modelPostEvent", {
                detail: { post: response },
              });
              document.dispatchEvent(modelPostEvent);
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

  createPost(
    postContent: string,
    postParent: string,
    channelPath: string
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

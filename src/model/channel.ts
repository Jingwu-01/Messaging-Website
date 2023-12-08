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

  /**
   * Constructs a new ModelChannel based on the received ChannelResponse.
   * @res A ChannelResponse received from an OwlDB Channel fetch.
   */
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
    let fetchUrl = getDatabasePath() + `${this.path}/posts/?mode=subscribe`;
    slog.info("subscribeToPosts", ["fetchUrl", `${fetchUrl}`]);
    fetchEventSource(fetchUrl, {
      headers: options,
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

  /**
   * Creates a new post
   * @param postContent The content of the post
   * @param postParent The post to reply to
   * @param channelPath The path of the channel to put the post in.
   * @returns The response from OwlDB
   */
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

  /**
   * Unsubscribes this channel from model post updates.
   */
  unsubscribe() {
    this.controller.abort();
    this.controller = new AbortController();
  }

  /**
   * @returns The name of this channel.
   */
  getName() {
    return this.path.split("/")[3];
  }
}

/**
 * This module encapsulates an adapter's representation of a post.
 */

import { PostResponse } from "../../../types/postResponse";
import { insertPostSorted } from "./handleSortingPosts";

/**
 * This class is the adapter's representation of a post. The adapter takes care of two primary
 * roles: 1. it ensures that all parents of posts are displayed before their parents, and 2 ensures
 * that the posts are displayed in order of creation time.
 */
export class AdapterPost {
  // The name of the post.
  private name: string;

  // The time that the post was created.
  private createdTime: number;

  // JSON representing the post's response.
  private response: PostResponse;

  // An array of posts that are its replies.
  private replies: Array<AdapterPost> = new Array<AdapterPost>();

  // The name of the post whose its parent.
  private parentName: string;

  // The index of the post; that is, the index that the post should be inserted in the view (with respect to ordering of replies)
  private postIndex: number | undefined;

  // The name of the channel this post is in.
  private channelName: string;

  // The name of the workspace this post is in.
  private workspaceName: string;

  // Creates a new AdapterPost, and also validates data.
  constructor(response: PostResponse) {
    // console.log(`AdapterPost constructor: response.path: ${response.path}`);
    // console.log(`AdapterPost constructor: response.path.split("/"): ${response.path.split("/")}`);
    // console.log(`AdapterPost constructor: response.path.split("/").pop(): ${response.path.split("/").pop()}`);
    let postPathArr = response.path.split("/");
    // Make sure that the path length is 6
    if (postPathArr.length !== 6) {
      throw new Error(
        "AdapterPost constructor: response path does not have 6 elements but needs to",
      );
    }
    // Set the name, workspace name, and channel name for the post.
    this.name = postPathArr[5];
    this.workspaceName = postPathArr[1];
    this.channelName = postPathArr[3];
    // Set the response and created time.
    this.response = response;
    this.createdTime = response.meta.createdAt;
    // Set the parent of the post, checking for error cases.
    if (response.doc.parent === undefined || response.doc.parent === "") {
      this.parentName = "";
    } else {
      let parentPathArr = response.doc.parent.split("/");
      if (parentPathArr.length !== 6) {
        throw new Error(
          "AdapterPost constructor: parentPathArr is not of the correct length",
        );
      }
      let parentName = parentPathArr[5];
      if (postPathArr[1] !== parentPathArr[1]) {
        throw new Error(
          "AdapterPost constructor: workspace name of parent and child are not equal",
        );
      }
      if (postPathArr[3] !== parentPathArr[3]) {
        throw new Error(
          "AdapterPost constructor: channel name of parent and child are not equal",
        );
      }
      if (parentName === undefined) {
        throw new Error(
          "AdapterPost constructor: internal server error (last element of parentPathArr is undefined)",
        );
      }
      if (parentName === this.name) {
        throw new Error("AdapterPost constructor: post is its own parent");
      }
      // Set the parent name.
      this.parentName = parentName;
    }
  }

  /**
   * Returns the name of the post
   * @returns a string representing the name of the post
   */
  getName() {
    return this.name;
  }

  /**
   * Returns the name of the post's parent
   * @returns a string representing the name of the parent
   */
  getParentName() {
    return this.parentName;
  }

  /**
   * Adds the post as a child to this post, accounting for whether or not the post already exists.
   * @param postChild The child to be upserted, an AdapterPost
   * @param exists A boolean indicating whether the post currently exists as this post's child or not
   * @returns an integer representing the index of the post
   */
  addChildPost(postChild: AdapterPost, exists: boolean) {
    // Delegate to a helper function.
    return insertPostSorted(this.replies, postChild, exists);
  }

  /**
   * Gets the time that this post is created.
   * @returns an integer representing the time that the post was created.
   */
  getCreatedTime() {
    return this.createdTime;
  }

  /**
   * Gets the PostResponse for this post.
   * @returns a PostResponse JSON object representing the body of the post.
   */
  getResponse() {
    return this.response;
  }

  /**
   * Sets the post index for the post.
   * @param postIndex an integer representing the post's index to be displayed in the view.
   */
  setPostIndex(postIndex: number) {
    this.postIndex = postIndex;
  }

  /**
   * Gets the post index.
   * @returns an integer representing the post's index.
   */
  getPostIndex() {
    return this.postIndex;
  }

  /**
   * Gets the string representing the name of the workspace for the post.
   * @returns a string representing the name of the workspace
   */
  getWorkspaceName() {
    return this.workspaceName;
  }

  /**
   * Gets the string representing the name of the channel.
   * @returns a string representing the name of the channel
   */
  getChannelName() {
    return this.channelName;
  }

  /**
   * Sets the replies of this post to be the replies from another adapter post.
   * @param oldPost another AdapterPost for which to copy the replies from.
   */
  setReplies(oldPost: AdapterPost) {
    this.replies = oldPost.replies;
  }
}

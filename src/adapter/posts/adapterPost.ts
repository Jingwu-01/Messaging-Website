/**
 * This module encapsulates an adapter's representation of a post.
 */

import { PostResponse } from "../../../types/postResponse";
import { slog } from "../../slog";
import { insertPostSorted } from "./handleSortingPosts";
import {
  validateExtension,
  validateParentPath,
  validatePostPath,
} from "./dataValidation";

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

  private starredIndex: number | undefined;

  private starred: boolean = false;

  private usersStarred: Array<string> = new Array<string>();

  /**
   * Creates a new AdapterPost, and additionally validates that the post repsonse is valid.
   * @param response a PostResponse object representing the JSON that is returned by the model.
   */
  constructor(response: PostResponse) {
    slog.info(
      "AdapterPost constructor: top of func call",
      ["response", response.path],
      ["response.path", response.path],
    );
    let postPathArr = validatePostPath(response.path);
    // Set the name, workspace name, and channel name for the post.
    this.name = postPathArr[5];
    this.workspaceName = postPathArr[1];
    this.channelName = postPathArr[3];
    // Set the response and created time.
    this.response = response;
    this.createdTime = response.meta.createdAt;
    // Set the parent name.
    this.parentName = validateParentPath(response.doc.parent, postPathArr);
    // this is safe.
    let adapterExtensions = validateExtension(response.doc.extensions);
    this.usersStarred = adapterExtensions["p2group50"];
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

  /**
   * Sets the starred index of the post (indicating the position the post should be added in the view).
   * @param starredIndex an integer representing the starred index of the post to add to the view.
   */
  setStarredIndex(starredIndex: number) {
    this.starredIndex = starredIndex;
  }

  /**
   * Retrieves the starred index; that is, the index of this post with respect to other starred posts.
   * @returns an integer representing this post's starred index.
   */
  getStarredIndex() {
    return this.starredIndex;
  }

  /**
   * Retrieves a boolean indicating whether or not this post is currently starred.
   * @returns a boolean indicating whether this post is starred or not.
   */
  getStarred() {
    return this.starred;
  }

  /**
   * Sets whether or not this post is now starred.
   * @param starred a boolean indicating whether or not this post is now starred.
   */
  setStarred(starred: boolean) {
    this.starred = starred;
  }

  /**
   * Returns an array of usernames indicating which users have starred this post.
   * @returns an array of usernames indicating who's starred this post.
   */
  getUsersStarred(): Array<string> {
    return this.usersStarred;
  }
}

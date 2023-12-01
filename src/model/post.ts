/**
 * The model's representation of a post.
 */

import { PostResponse } from "../../types/postResponse";

export class ModelPost {
  // The name of the post.
  private name: string;

  // The response that this post encapsulates.
  private response: PostResponse;

  // The replies of this post, mapping from strings to ModelPosts.
  private replies: Map<string, ModelPost>;

  // The string name of the parent for this post.
  private parentName: string;

  /**
   * A constructor for this ModelPost.
   */
  constructor(response: PostResponse) {
    // TODO: add more robust error handling here.
    console.log(`ModelPost constructor: response.path: ${response.path}`);
    console.log(
      `ModelPost constructor: response.path.split("/"): ${response.path.split(
        "/",
      )}`,
    );
    console.log(
      `ModelPost constructor: response.path.split("/").pop(): ${response.path
        .split("/")
        .pop()}`,
    );
    let name = response.path.split("/").pop();
    if (name === undefined) {
      throw Error(
        "ModelPost constructor: internal server error; path is an empty string",
      );
    }
    this.name = name;
    this.response = response;
    this.replies = new Map<string, ModelPost>();

    if (response.doc.reactions == undefined) {
      this.response.doc.reactions = {
        smile: [],
        frown: [],
        like: [],
        celebrate: [],
      };
    }

    if (response.doc.parent === undefined || response.doc.parent === "") {
      this.parentName = "";
    } else {
      let parentPathArr = response.doc.parent.split("/");
      if (parentPathArr.length !== 6) {
        throw new Error(
          "model post constructor: parentPathArr is not of the correct length",
        );
      }
      let parentName = parentPathArr.pop();
      if (parentName === undefined) {
        throw new Error(
          "model post constructor: internal server error (last element of parentPathArr is undefined)",
        );
      }
      this.parentName = parentName;
    }
  }

  /**
   * Returns the JSON object representing the PostResponse for this post.
   */
  getResponse(): PostResponse {
    return this.response;
  }

  /**
   * Returns the replies to this post in the form of a map.e
   */
  getReplies(): Map<string, ModelPost> {
    return this.replies;
  }

  /**
   * Returns the name of this post as a string.
   */ getName(): string {
    return this.name;
  }

  /**
   * Returns the name of the parent of this post as a string.
   */ getParentName(): string {
    return this.parentName;
  }

  /**
   * Adds a ModelPost with a parentPath array to this ModelPost recurisvely. Deprecated function.
   * @param newPost a ModelPost to be added
   * @param parentPath an array of strings representing the path to this pots
   * @returns a boolean indicating whether or not this post was successfully added.
   */ addReply(newPost: ModelPost, parentPath: string[]): Boolean {
    if (parentPath.length === 0) {
      this.replies.set(newPost.name, newPost);
      return true;
    }
    let parentName = parentPath[0];
    let nextChild = this.replies.get(parentName);
    if (nextChild === undefined) {
      console.log(`addReply: invalid parent path for post ${newPost.name}`);
      return false;
    }
    return nextChild.addReply(newPost, parentPath.slice(1));
  }

  /**
   * Adds a model post as a child to this post.
   * @param newPost a ModelPost to be added as a child to this post
   * @returns a boolean indicating whether the post was successfully added to this ModelPost
   */ addChildPost(newPost: ModelPost): Boolean {
    this.replies.set(newPost.name, newPost);
    return true;
  }
}

import { PostResponse } from "../../types/postResponse";

export class ModelPost {
  private name: string;

  private response: PostResponse;

  private replies: Map<string, ModelPost>;

  private parentName: string;

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

  getResponse(): PostResponse {
    return this.response;
  }

  getReplies(): Map<string, ModelPost> {
    return this.replies;
  }

  getName(): string {
    return this.name;
  }

  addReply(newPost: ModelPost, parentPath: string[]): Boolean {
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

  addChildPost(newPost: ModelPost): Boolean {
    this.replies.set(newPost.name, newPost);
    return true;
  }
}

import { PostResponse } from "./responseTypes";

export class ModelPost {
  
  private name: string;

  private response: PostResponse;

  private replies: Map<string, ModelPost>;

  constructor(response: PostResponse) {
    console.log(`Post constructor: response.path: ${response.path}`);
    console.log(`Post constructor: response.path.split("/"): ${response.path.split("/")}`);
    console.log(`Post constructor: response.path.split("/").pop(): ${response.path.split("/").pop()}`);
    let name = response.path.split("/").pop()
    if (name === undefined) {
      throw Error("ModelPost constructor: internal server error; path is an empty string");
    }
    this.name = name;
    this.response = response;
    this.replies = new Map<string, ModelPost>();
  }

  getResponse(): PostResponse {
    return this.response;
  }

  getReplies(): Map<string, ModelPost> {
    return this.replies;
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
}
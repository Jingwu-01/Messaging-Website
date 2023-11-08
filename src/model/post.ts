import { PostResponse } from "./responseTypes";

export class ModelPost {
  
  private name: string;

  private response: PostResponse;

  private replies: Map<string, ModelPost>;

  constructor(response: PostResponse) {
    this.name = response.path.split("/")[-1];
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
      console.log("addReply: error: parentPath is empty (internal server error)");
      return false;
    }
    let parentName = parentPath[0];
    if (parentPath.length === 1) {
      if (parentName === this.name) {
        this.replies.set(newPost.name, newPost);
        return true;
      }
      return false;
    }
    let nextChild = this.replies.get(parentName);
    if (nextChild === undefined) {
      console.log(`addReply: invalid parent path for post ${newPost.name}`);
      return false;
    }
    return nextChild.addReply(newPost, parentPath.slice(1));
  }
}
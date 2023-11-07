import { PostResponse } from "./responseTypes";

export class ModelPost {
  
  private name: string;
  private parent: string;
  private lastModifiedAt: number;

  private replies: Map<string, ModelPost> = new Map<string, ModelPost>();

  constructor(response: PostResponse) {
    this.parent = response.doc.parent;
    this.lastModifiedAt = response.meta.lastModifiedAt;
    this.name = response.path.split("/")[-1];
  }

  getParent() {
    return this.parent;
  }
  
  getLastModifiedAt() {
    return this.lastModifiedAt;
  }

  addReply(postName: string, post: ModelPost) {
    this.replies.set(postName, post);
  }

  
}
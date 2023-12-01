import { PostResponse } from "../../../types/postResponse";
import { insertPostSorted } from "./handleSortingPosts";

export class AdapterPost {
  private name: string;

  private createdTime: number;

  private response: PostResponse;

  private replies: Array<AdapterPost> = new Array<AdapterPost>();

  private parentName: string;

  private postIndex: number | undefined;

  private channelName: string;

  private workspaceName: string;

  constructor(response: PostResponse) {
    // TODO: add more robust error handling here.
    // console.log(`AdapterPost constructor: response.path: ${response.path}`);
    // console.log(`AdapterPost constructor: response.path.split("/"): ${response.path.split("/")}`);
    // console.log(`AdapterPost constructor: response.path.split("/").pop(): ${response.path.split("/").pop()}`);
    let postPathArr = response.path.split("/");
    if (postPathArr.length !== 6) {
      throw new Error(
        "AdapterPost constructor: response path does not have 6 elements but needs to",
      );
    }
    this.name = postPathArr[5];
    this.workspaceName = postPathArr[1];
    this.channelName = postPathArr[3];
    this.response = response;
    this.createdTime = response.meta.createdAt;
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
      this.parentName = parentName;
    }
  }

  getName() {
    return this.name;
  }

  getParentName() {
    return this.parentName;
  }

  addChildPost(postChild: AdapterPost, exists: boolean) {
    return insertPostSorted(this.replies, postChild, exists);
  }

  getCreatedTime() {
    return this.createdTime;
  }

  getResponse() {
    return this.response;
  }

  setPostIndex(postIndex: number) {
    this.postIndex = postIndex;
  }

  getPostIndex() {
    return this.postIndex;
  }

  getWorkspaceName() {
    return this.workspaceName;
  }

  getChannelName() {
    return this.channelName;
  }

  setReplies(oldPost: AdapterPost) {
    this.replies = oldPost.replies;
  }
}

import getStateManager from ".";
import { CreateResponse } from "../../types/createResponse";
import { PostResponse } from "../../types/postResponse";
import { AdapterPost } from "../adapter/posts/adapterPost";
import { adapterViewPostConverter } from "../adapter/posts/adapterViewPostConverter";
import { insertPostSorted } from "../adapter/posts/handleSortingPosts";
import { slog } from "../slog";
import { CreatePostEvent, ViewPostUpdate } from "../view/datatypes";
import { getView } from "../view/view";

export class PostsManager {
  private adapterPosts: Map<string, AdapterPost> = new Map<
    string,
    AdapterPost
  >();

  private pendingPosts: Map<string, Array<AdapterPost>> = new Map<
    string,
    Array<AdapterPost>
  >();

  private rootAdapterPosts: Array<AdapterPost> = new Array<AdapterPost>();

  createPost(postData: CreatePostEvent) {
    // TODO: consider if we want to enforce that a channel are open in order to send a message?
    let channel = getStateManager().getOpenChannel();
    if (channel === null) {
      throw new Error("Cannot add a post: no open channel");
    }
    channel
      .createPost(postData.msg, postData.parent, channel.path)
      .then((result: CreateResponse) => {
        slog.info("createPost: added to the database");
      })
      .catch((error: unknown) => {
        // TODO: notify view that their post failed for whatever reason.
        throw Error("createPost: creating the post failed");
      });
  }

  serializePostResponse(response: PostResponse): [boolean, string] {
    slog.info(
      "serializePostResponse",
      ["this.adapterPosts", this.adapterPosts],
      ["response", response],
    );
    let newPost: AdapterPost;
    try {
      newPost = new AdapterPost(response);
    } catch (error) {
      return [false, (error as Error).message];
    }
    let postIsAlive = this.verifyAlivePost(newPost);
    let exists: boolean;
    if (!postIsAlive[0]) {
      return [false, postIsAlive[1]];
    }
    let postName = newPost.getName();
    let parentName = newPost.getParentName();
    if (this.adapterPosts.get(newPost.getName()) !== undefined) {
      exists = true;
    } else {
      exists = false;
    }
    if (newPost.getParentName() === "") {
      this.adapterPosts.set(postName, newPost);
      this.updateAdapterPost(newPost, exists);
      this.addPendingPosts(postName, newPost);
      return [true, "successfully added root level post"];
    }
    let parentPost = this.adapterPosts.get(parentName);
    if (parentPost === undefined) {
      slog.info("serializePostResponse", ["parentPost is undefined", ""]);
      let parentPendingPosts = this.pendingPosts.get(parentName);
      let postAlreadyPending: boolean = false;
      if (parentPendingPosts === undefined) {
        parentPendingPosts = new Array<AdapterPost>();
      }
      for (let pendingPost of parentPendingPosts) {
        if (pendingPost.getName() === postName) {
          postAlreadyPending = true;
          break;
        }
      }
      if (!postAlreadyPending) {
        parentPendingPosts.push(newPost);
      }
      this.pendingPosts.set(parentName, parentPendingPosts);
      return [true, "parent post isn't yet defined, so the post is pending"];
    }
    this.adapterPosts.set(postName, newPost);
    this.updateAdapterPost(newPost, exists);
    this.addPendingPosts(postName, newPost);
    return [true, "added post, parent exists"];
  }

  addPendingPosts(addedPostName: string, addedPost: AdapterPost) {
    slog.info(
      "addPendingPosts: called",
      ["addedPostName", addedPostName],
      ["addedPost", addedPost],
    );
    let parentPendingPosts = this.pendingPosts.get(addedPostName);
    if (parentPendingPosts === undefined) {
      return;
    }
    parentPendingPosts.forEach((pendingPost: AdapterPost) => {
      this.adapterPosts.set(pendingPost.getName(), pendingPost);
      this.updateAdapterPost(pendingPost, false);
      this.addPendingPosts(pendingPost.getName(), pendingPost);
    });
    this.pendingPosts.delete(addedPostName);
  }

  verifyAlivePost(newPost: AdapterPost): [boolean, string] {
    let postWorkspace = newPost.getWorkspaceName();
    let postChannel = newPost.getChannelName();
    if (postWorkspace !== getStateManager().getOpenWorkspaceName()) {
      return [false, "post workspace is invalid"];
    }
    if (postChannel !== getStateManager().getOpenChannelName()) {
      return [false, "post channel is invalid"];
    }
    return [true, ""];
  }

  updateAdapterPost(adapterPost: AdapterPost, exists: boolean) {
    slog.info(
      "updateModelPost: top of func call",
      [
        "this.adapterPosts",
        `${JSON.stringify(Object.fromEntries(this.adapterPosts))}`,
      ],
      ["this.rootAdapterPosts", `${JSON.stringify(this.rootAdapterPosts)}`],
    );
    this.upsertAdapterPost(adapterPost, exists);
    slog.info(
      "updateModelPost: bottom of func call",
      [
        "this.adapterPosts",
        `${JSON.stringify(Object.fromEntries(this.adapterPosts))}`,
      ],
      ["this.rootAdapterPosts", `${JSON.stringify(this.rootAdapterPosts)}`],
    );
  }

  upsertAdapterPost(adapterPost: AdapterPost, exists: boolean) {
    let parentPost = this.adapterPosts.get(adapterPost.getParentName());
    let insertedIdx = -1;
    if (parentPost !== undefined) {
      insertedIdx = parentPost.addChildPost(adapterPost, exists);
    } else {
      insertedIdx = this.insertRootAdapterPost(adapterPost, exists);
    }
    if (insertedIdx === -1) {
      slog.error("upsertAdapterPost", ["insertedIdx is -1", `${insertedIdx}`]);
    }
    adapterPost.setPostIndex(insertedIdx);
    let op: "insert" | "modify";
    if (exists) {
      op = "modify";
    } else {
      op = "insert";
    }
    let viewPost = adapterViewPostConverter(adapterPost);
    let updatedPost: ViewPostUpdate = {
      allPosts: [],
      op: op,
      affectedPosts: [viewPost],
    };
    getView().displayPosts(updatedPost);
  }

  insertRootAdapterPost(adapterPost: AdapterPost, exists: boolean) {
    // binary search
    return insertPostSorted(this.rootAdapterPosts, adapterPost, exists);
  }
}

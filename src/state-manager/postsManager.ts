import { CreateResponse } from "../../types/createResponse";
import { PostResponse } from "../../types/postResponse";
import { AdapterPost } from "../adapter/posts/adapterPost";
import { adapterViewPostConverter } from "../adapter/posts/adapterViewPostConverter";
import {
  insertPostSorted,
  insertStarredPostSorted,
  removePostSorted,
} from "../adapter/posts/handleSortingPosts";
import { StateManagerInterface, ViewInterface } from "../interfaces";
import { slog } from "../slog";
import { CreatePostEvent, ViewPostUpdate } from "../view/datatypes";

/**
 * This class stores the posts in a tree, and calls functions on the view to display
 * the updated post. This class ensures that (1) each post's parent is added before the
 * post itself and (2) each post is inserted according to ascending order of timestamp.
 */
export class PostsManager {
  private view: ViewInterface;

  private stateManager: StateManagerInterface;

  private adapterPosts: Map<string, AdapterPost> = new Map<
    string,
    AdapterPost
  >();

  private pendingPosts: Map<string, Array<AdapterPost>> = new Map<
    string,
    Array<AdapterPost>
  >();

  private rootAdapterPosts: Array<AdapterPost> = new Array<AdapterPost>();

  private starredPosts: Array<AdapterPost> = new Array<AdapterPost>();

  /**
   * Creates a PostsManager class, with a ViewInterface that receives post updates
   * as well as a StateManager interface that stores the currently opened
   * workspace and channel to decide whether a post is relevant to the opened channel.
   * @param view a view interface receiving post updates
   * @param stateManager a state manager interface storing the currently opened workspace and channel name
   */
  constructor(view: ViewInterface, stateManager: StateManagerInterface) {
    this.view = view;
    this.stateManager = stateManager;
  }

  /**
   * Creates a new post in the corresponding channel in the model, with the given
   * message and parent post path.
   * @param postData an event encapsulating the post's message, as well as its parent post path
   */
  createPost(postData: CreatePostEvent) {
    let channel = this.getStateManager().getOpenChannel();
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

  /**
   * A function that inserts the PostResponse received by the model into the tree
   * of AdapterPosts. It does this by first checking that the parent post has been received,
   * and does not display the post if its parent has not been received. Then,
   * if the parent post has been received, it inserts this post into the parent's posts children
   * based on ascending order of timestamp.
   * @param response an object representing the JSON response received by the server
   * @returns a [boolean, string] where the first element represents if an error occurred, while
   * the second element is the string message for the error.
   */
  serializePostResponse(response: PostResponse): [boolean, string] {
    slog.info(
      "serializePostResponse",
      ["this.adapterPosts", this.adapterPosts],
      ["this.rootAdapterPosts", this.rootAdapterPosts],
      ["this.pendingPosts", this.pendingPosts],
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

  /**
   * Adds all children post events that were received before this post was received to the
   * post tree.
   * @param addedPostName the name of the parent post that is added
   * @param addedPost the parent post itself
   * @returns nothing (adds all children posts of this parent to the post tree)
   */
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

  /**
   * Checks if the adapter post matches the currently opened channel and workspace
   * name.
   * @param newPost an AdapterPost representing the post to add to this channel
   * @returns a [boolean, string] where the first element represents whether or not the
   * post is alive, and the second element contains a string encapsulating the error message
   * if the post is not alive.
   */
  verifyAlivePost(newPost: AdapterPost): [boolean, string] {
    let postWorkspace = newPost.getWorkspaceName();
    let postChannel = newPost.getChannelName();
    if (postWorkspace !== this.getStateManager().getOpenWorkspaceName()) {
      return [false, "post workspace is invalid"];
    }
    if (postChannel !== this.getStateManager().getOpenChannelName()) {
      return [false, "post channel is invalid"];
    }
    return [true, ""];
  }

  /**
   * Updates the adapter post in the tree by delegating to upsertAdapterPost.
   * @param adapterPost an AdapterPost that is to be added to the post tree.
   * @param exists a boolean indicating whether or not the adapter post currently exists in the post tree.
   */
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

  /**
   * Updates or inserts the adapter post in the post tree, based on whether or not it currently exists in the post tree.
   * Additionally calls a method on the view to display the modified post.
   * @param adapterPost an AdapterPost to upsert into the post tree
   * @param exists a boolean indicating whether or not the AdapterPost currently exists in the tree
   */
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

    // upsert for extension
    let [starredIdx, starOp] = this.insertStarredPost(adapterPost, exists);
    if (starredIdx === -1) {
      slog.error("upsertAdapterPost", ["starredIdx is -1", starredIdx]);
    }

    adapterPost.setStarredIndex(starredIdx);

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
      starOp: starOp,
    };
    slog.info(
      "upsertAdapterPost: end of func call",
      ["updatedPost", updatedPost],
      ["this.starredPosts", this.starredPosts],
    );
    this.getView().displayPosts(updatedPost);
  }

  /**
   * Inserts the adapter post at the root of the tree.
   * @param adapterPost an AdapterPost that is to be inserted at the root
   * @param exists a boolean indicating whether or not the AdapterPost currently exists in the tree
   * @returns an integer representing the index of the post that was upserted
   */
  insertRootAdapterPost(adapterPost: AdapterPost, exists: boolean) {
    // binary search
    return insertPostSorted(this.rootAdapterPosts, adapterPost, exists);
  }

  /**
   * Inserts the adapter post into the starred posts array, dealing with a variety of cases of whether or not
   * the new post is starred or not, the existing post is starred or not, and whether the post currently exists or not.
   * @param adapterPost an AdapterPost to be upserted into the starred posts array
   * @param exists a boolean indicating whether or not the post currently exists in the post tree (which
   * does not necessarily mean that the adapter post is a starred post)
   * @returns a [number, StarOps] where the first element represents the index that the starred posts is upserted
   * into the starred posts array, and the second element represents the operation to be performed for this starred post
   * (either insertion, modification, removal, or no operation).
   */
  insertStarredPost(
    adapterPost: AdapterPost,
    exists: boolean,
  ): [number, StarOps] {
    // slog.info("insertStarredPost", ["exists", exists], ["isRespPostStarred(adapterPost)", isRespPostStarred(adapterPost)], ["adapterPost.getStarred()", adapterPost.getStarred()]);
    if (exists) {
      if (this.isRespPostStarred(adapterPost)) {
        return insertStarredPostSorted(this.starredPosts, adapterPost);
      } else {
        return removePostSorted(this.starredPosts, adapterPost);
      }
    } else {
      if (this.isRespPostStarred(adapterPost)) {
        return insertStarredPostSorted(this.starredPosts, adapterPost);
      } else {
        return [-2, "nop"];
      }
    }
  }

  /**
   * Returns the view that this posts manager updates.
   * @returns the view interface that this state manager updates with posts..
   */
  getView() {
    return this.view;
  }

  /**
   * Returns the state manager that this posts manager needs information from;
   * specifically, the currently open workspace and channel name.
   * @returns the state manager interface that this posts manager requests information from.
   */
  getStateManager() {
    return this.stateManager;
  }

  /**
   * Determines whether or not the adapterPost is starred, given the currently logged in user
   * stored in the state manager.
   * @param adapterPost an AdapterPost representing the starred post to be displayed in the view
   * @returns a boolean indicating whether or not the input adapterPost is starred
   */
  isRespPostStarred(adapterPost: AdapterPost): boolean {
    let usersStarred = adapterPost.getUsersStarred();
    let loggedInUser = this.getStateManager().getLoggedInUser();
    if (loggedInUser === null) {
      // this should never happen. enforce that user, ws, and channel have null equivalence.
      slog.error(
        "isRespPostStarred: loggedInUser is null but this should be impossible",
      );
      return false;
    }
    return usersStarred.includes(loggedInUser);
  }
}

// The four operations that can be done on a starred post are modification, insertion, deletion, or no operation.
export type StarOps = "modify" | "insert" | "delete" | "nop";

/**
 * Helper functions for sorting posts.
 */

import { slog } from "../../slog";
import { StarOps } from "../../state-manager/postsManager";
import { AdapterPost } from "./adapterPost";

/**
 * Given a list of sorted posts in order of increasing timestamp, finds
 * the index to insert this new post. Assumes that timestamps are unique.
 * @param postList an array of AdapterPost representing the list of posts to upsert into
 * @param newPost an AdapterPost to upsert into the list
 * @returns an integer representing the index of the post to upsert in postList
 */
function findSortedIdx(postList: Array<AdapterPost>, newPost: AdapterPost) {
  let idx: number;
  slog.info("findSortedIdx", ["postList", postList], ["newPost", newPost]);
  for (idx = 0; idx < postList.length; idx++) {
    if (newPost.getCreatedTime() <= postList[idx].getCreatedTime()) {
      break;
    }
  }
  slog.info("findSortedIdx: found idx", ["idx", idx]);
  return idx;
}

/**
 * Function that upserts a post into an array of posts, with a boolean indicating whether the post exists or not.
 * @param postList An array of adapterpost to insert into.
 * @param newPost An adapterpost to insert into the array.
 * @param exists A boolean indicating whether the posts currently exists in the array or not, to upsert.
 * @returns the index that newPost is located in postList
 */
export function insertPostSorted(
  postList: Array<AdapterPost>,
  newPost: AdapterPost,
  exists: boolean,
): number {
  let idx = findSortedIdx(postList, newPost);
  if (exists) {
    if (postList[idx].getName() !== newPost.getName()) {
      slog.error("insertPostSorted: could not find existing post with the same name", ["postList[idx]", postList[idx]], ["newPost", newPost]);
      throw new Error(
        "couldn't find a post with the same name as the post already exists",
      );
    }
    newPost.setReplies(postList[idx]);
    postList[idx] = newPost;
  } else {
    postList.splice(idx, 0, newPost);
  }
  return idx;
}

/**
 * Removes a post from an array of posts, assuming that the array of posts is sorted in increasing order
 * of created at timestamps. Also assumes that timestamps are unique.
 * @param postList an array of AdapterPost representing the posts we currently have
 * @param curPost an AdapterPost representing the post that we want to remove from postList
 * @returns a [number, StarOps] pair where the first element represents the index that this post
 * was removed from, and the second element represents the operation to perform on the view post.
 */
export function removePostSorted(postList: Array<AdapterPost>, curPost: AdapterPost): [number, StarOps] {
  let idx = findSortedIdx(postList, curPost);
  if (postList.length === 0 || idx === postList.length) {
    return [-2, "nop"];
  } else if (postList[idx].getName() === curPost.getName()) {
    slog.info("removePostSorted: could not find existing post with the same name", ["postList[idx]", postList[idx]], ["curPost", curPost]);
    postList.splice(idx, 1);
    return [idx, "delete"];
  } else {
    return [-2, "nop"];
  }
}

/**
 * Upserts a starred post into an array of posts. Notably, we do not know if the post currently exists, but
 * we assume that timestamps are unique, so we upsert the starred post into the array accordingly.
 * @param postList an array of posts representing the starred posts to insert into
 * @param curPost an AdapterPost representing the post to upsert into the array
 * @returns a [number, StarOps] pair, where the first element represents the index that the post was upserted,
 * and the second element represents the operation to perform on the upsertedpost
 */
export function insertStarredPostSorted(postList: Array<AdapterPost>, curPost: AdapterPost): [number, StarOps] {
  let idx = findSortedIdx(postList, curPost);
  let starOp: StarOps;
  if (idx === postList.length) {
    postList.splice(idx, 0, curPost);
    starOp = "insert";
  } else if (postList[idx].getName() === curPost.getName()) {
    curPost.setReplies(postList[idx]);
    postList[idx] = curPost;
    starOp = "modify";
  } else {
    postList.splice(idx, 0, curPost);
    starOp = "insert";
  }
  curPost.setStarred(true);
  return [idx, starOp];
}

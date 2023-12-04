/**
 * Helper functions for sorting posts.
 */

import { slog } from "../../slog";
import { StarOps } from "../../state-manager/utils";
import { AdapterPost } from "./adapterPost";


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

  // Attempted binary search implementation; gave up. can always change this later.

  // let low = 0;
  // let high = postList.length;
  // while (low < high) {
  //   let mid = Math.floor((low + high) / 2);
  //   if (postList[mid].getCreatedTime() === newPost.getCreatedTime()) {
  //     postList.splice(mid, 0, newPost)
  //     return mid;
  //   } else if (postList[mid].getCreatedTime() < newPost.getCreatedTime()) {
  //     low = mid + 1;
  //   } else {
  //     high = mid - 1;
  //   }
  // }
  // postList.splice(low, 0, newPost);
  // return low;
  // insert at low
}

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

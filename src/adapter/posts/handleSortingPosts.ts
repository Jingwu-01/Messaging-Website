/**
 * Helper functions for sorting posts.
 */

import { slog } from "../../slog";
import { AdapterPost } from "./adapterPost";

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
  let idx: number;
  slog.info("insertPostSorted", ["postList", postList], ["newPost", newPost]);
  for (idx = 0; idx < postList.length; idx++) {
    if (newPost.getCreatedTime() <= postList[idx].getCreatedTime()) {
      break;
    }
  }
  slog.info("insertPostSorted: found idx", ["idx", idx]);
  if (exists) {
    if (postList[idx].getName() !== newPost.getName()) {
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

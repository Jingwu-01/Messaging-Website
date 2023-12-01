import { slog } from "../../slog";
import { AdapterPost } from "./adapterPost";

// can have this take in a custom comparison function if you want.
export function insertPostSorted(postList: Array<AdapterPost>, newPost: AdapterPost, exists: boolean): number {

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
      throw new Error("couldn't find a post with the same name as the post already exists");
    }
    newPost.setReplies(postList[idx]);
    postList[idx] = newPost;
  } else {
    postList.splice(idx, 0, newPost);
  }
  return idx;



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
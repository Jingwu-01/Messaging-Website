import { AdapterPost } from "./adapterPost";

// can have this take in a custom comparison function if you want.
export function insertPostSorted(postList: Array<AdapterPost>, newPost: AdapterPost): number {
    let low = 0;
    let high = postList.length;
    while (low < high) {
      let mid = Math.floor((low + high) / 2);
      if (postList[mid].getCreatedTime() === newPost.getCreatedTime()) {
        postList.splice(mid, 0, newPost)
        return mid;
      } else if (postList[mid].getCreatedTime() < newPost.getCreatedTime()) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    postList.splice(low, 0, newPost);
    return low;
    // insert at low
}
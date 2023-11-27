import { AdapterPost } from "./adapterPost";

// can have this take in a custom comparison function if you want.
function insertPostSorted(postList: Array<AdapterPost>, newPost: AdapterPost) {
    let low = 0;
    let high = postList.length;
    while (low < high) {
      let mid = Math.floor(low / high);
      if (postList[mid])
    }
    // insert at low
}
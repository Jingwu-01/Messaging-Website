import { PostsEvent } from "../model/modelTypes";
import { initPosts } from "./posts/init";

export function initAdapter() {
  initPosts()
}
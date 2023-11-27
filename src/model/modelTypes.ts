import { ModelPost } from "./post";

// An event that is thrown every time we receive a new post.
export type PostsEvent = {
    postRoots: Array<ModelPost>;
};
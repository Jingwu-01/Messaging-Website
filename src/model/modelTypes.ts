import { ModelPost } from "./post";

// Represents the information (token and expiration time) for a user 
export type UserInfo = {
    token: string;
};

// An event that is thrown every time we receive a new post.
export type PostsEvent = {
    postRoots: Array<ModelPost>;
};
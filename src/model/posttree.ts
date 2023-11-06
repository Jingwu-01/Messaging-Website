import { ModelPost } from "./post";

export class PostTree {
    private roots: Array<ModelPost>;
    
    constructor() {
        this.roots = [];
    }

    addPost(newPost: ModelPost) {
        if (newPost.getParent() === "") {
            this.roots.push(newPost);
            return;
        }
        let parentPath = newPost.getParent().split("/");
        parentPath = parentPath[]
    }
}
import { PostTree } from "../model/posttree";
import { PostDisplay } from "./components/pages/chatPage/postDisplayComponent";

interface PostListener {
    displayPosts(posts: PostTree): void
}

// TODO: think about how to consoldiate all functionality in the view?
export class View {
   private postsDisplay: PostDisplay | null = null;

   constructor() {
    this.postsDisplay = document.querySelector("post-display");
    if (!(this.postsDisplay instanceof PostDisplay)) {
        console.log("")
    }
   }

   private postListeners: Array<PostListener> = new Array<PostListener>()

   addPostListener(listener: PostListener) {
    this.postListeners.push(listener)
   }

   displayPosts(posts: Array<ViewPost>) {
    this.postListeners.forEach((listener) => {
        listener.displayPosts(posts)
    })
   }
}

// view singleton
let view: View = new View()
export function getView() {
    return view
}
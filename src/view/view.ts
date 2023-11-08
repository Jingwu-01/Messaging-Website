import { PostDisplay } from "./components/pages/chatPage/postDisplayComponent";
import { ViewPost } from "./datatypes";

interface PostListener {
    displayPosts(posts: Array<ViewPost>): void
}

// TODO: think about how to consoldiate all functionality in the view?
export class View {

   private postListener: PostListener | null = null;

   constructor() {
   }


   setPostListener(listener: PostListener) {
    this.postListener = listener;
   }

   clearPostListener() {
    this.postListener = null;
   }

   displayPosts(posts: Array<ViewPost>) {
    this.postListener?.displayPosts(posts);
   }
}

// view singleton
let view: View = new View();
export function getView() {
    return view
}
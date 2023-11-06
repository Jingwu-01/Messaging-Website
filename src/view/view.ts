import { PostDisplay } from "./components/pages/chatPage/postDisplayComponent";

// TODO: think about how to consoldiate all functionality in the view?
export class View {
   private postsDisplay: PostDisplay | null = null;

   constructor() {
    this.postsDisplay = document.querySelector("post-display");
    if (!(this.postsDisplay instanceof PostDisplay)) {
        console.log("")
    }
   }
}
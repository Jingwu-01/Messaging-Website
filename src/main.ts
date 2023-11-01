import { OwlDBModel } from "./model/model";
import { ModelPost, PostsEvent } from "./model/modelTypes";
import { slog } from "./slog";

/**
 * Declare names and types of environment variables.
 */
declare const process: {
  env: {
    DATABASE_HOST: string;
    DATABASE_PATH: string;
    AUTH_PATH: string;
  };
};

// TODO: just a placeholder function for testing posts
// because I can't get jest to work for some reason
function testUpdatePosts(model: OwlDBModel): void {
  model.subscribeToPosts("ws1", "ch1");
}

/**
 * Inital entry to point of the application.
 */
function main(): void {
  slog.info("Using database", [
    "database",
    `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}`,
  ]);
  const model = new OwlDBModel();
  testUpdatePosts(model);
  document.addEventListener(
    "postsEvent",
    function (evt: CustomEvent<PostsEvent>) {
      // TODO: change console.log to slog
      console.log("postsEvent", evt);
      
  });
  
}

function getViewPosts(modelPosts: Array<ModelPost>): Array<ViewPost> {
  let sortedPosts = modelPosts.toSorted((a, b) => a.Path.split("/")[])
}

/* Register event handler to run after the page is fully loaded. */
document.addEventListener("DOMContentLoaded", () => {
  main();
});

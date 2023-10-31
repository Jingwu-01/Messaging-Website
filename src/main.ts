import { OwlDBModel } from "./model/model";
import { PostsEvent } from "./model/modelTypes";
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
function testUpdatePosts(model: OwlDBModel) {
  model.subscribeToPosts("ws1", "coll1");
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
      console.log("postsEvent", evt);
  });
  
}

/* Register event handler to run after the page is fully loaded. */
document.addEventListener("DOMContentLoaded", () => {
  main();
});

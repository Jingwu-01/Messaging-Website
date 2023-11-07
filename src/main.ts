import { initAdapter } from "./adapter/init";
import { OwlDBModel, getModel } from "./model/model";
import { ModelPost, PostsEvent } from "./model/modelTypes";
import { slog } from "./slog";
import { ViewPost } from "./view/datatypes";

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

// // TODO: just a placeholder function for testing posts
// // because I can't get jest to work for some reason
async function testUpdatePosts(model: OwlDBModel) {
  await model.login("user1");
  // TODO: how to do subscriptions when the model has the token?
  // hard to refactor because the fetchEventSource is pretty different from the fetch function.
  (await (await model.getWorkspace("ws1")).getChannel("ch1")).subscribeToPosts("ws1", "ch1", model.getToken());
  // model.login("user1").then(() => {
  //   model.getWorkspace("ws1").then((ws) => {
  //     ws.getChannel("ch1").then((chan) => {
  //       chan.subscribeToPosts("ws1", "ch1");
  //     });
  //   })
  // })
}

/**
 * Inital entry to point of the application.
 */
function main(): void {
  slog.info("Using database", [
    "database",
    `${process.env.DATABASE_HOST}${process.env.DATABASE_PATH}`,
  ]);
  // Initialize a model for testing purposes
  // TODO: change later when I figure out how to use jest
  const model = getModel();
  testUpdatePosts(model);
  // *Placeholder, testing code to ensure that we are listening for posts
  // correctly.*
  initAdapter();
  // example for how to use OOP model for posts
  // getModel().getWorkspace("this_workspace").getChannel("channel").getPost("")
}

function viewPostConverter(modelPost: ModelPost): ViewPost {
  return {
    
  }
}

// Function that converts a tree of modelposts into an array of Viewposts.
// Viewposts will form a tree-like structure for posts.
function getViewPosts(modelPostRoots: Map<string, ModelPost>): Array<ViewPost> {
  // let sortedPosts = modelPosts.toSorted((a, b) => a.Path.split("/")[])
  let viewPostRoots = new Array<ViewPost>();
  let topModelPosts = Array.from(modelPostRoots.values());
  topModelPosts.sort((a, b) => a.getResponse().meta.createdAt < b.getResponse().meta.createdAt ? -1 :
  a.getResponse().meta.createdAt > b.getResponse().meta.createdAt ? 1 : 0);
  for (let topModelPost of topModelPosts) {
    viewPostRoots.push()
  }
  return [];
}

// modifies viewPosts inplace
function getViewPostsHelper(curViewPost: ViewPost, curModelPostRoots: Map<string, ModelPost>, viewPosts: Array<ViewPost>): void {
  
}

/* Register event handler to run after the page is fully loaded. */
document.addEventListener("DOMContentLoaded", () => {
  main();
});

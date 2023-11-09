import { initAdapter } from "./adapter/init";
import { OwlDBModel, getModel } from "./model/model";
import { ModelPost } from "./model/post";
import { PostTree } from "./model/posttree";
import { slog } from "./slog";
import PostDisplay from "./view/components/pages/chatPage/postDisplayComponent";
import { ViewPost } from "./view/datatypes";
import { LoginEvent } from "./view/components/pages/homePage/index";
import { initView } from "./view/init";
import { PostsEvent } from "./model/modelTypes";

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

// TODO: can you declare a global in both the model AND the view?
declare global {
  interface DocumentEventMap {
    postsEvent: CustomEvent<PostsEvent>;
    loginEvent: CustomEvent<LoginEvent>;
  }
}

// // // TODO: just a placeholder function for testing posts
// // // because I can't get jest to work for some reason
// async function testUpdatePosts(model: OwlDBModel) {
//   await model.login("user1");
//   // TODO: how to do subscriptions when the model has the token?
//   // hard to refactor because the fetchEventSource is pretty different from the fetch function.
//   (await (await model.getWorkspace("ws1")).getChannel("ch1")).subscribeToPosts("ws1", "ch1", model.getToken());
//   // model.login("user1").then(() => {
//   //   model.getWorkspace("ws1").then((ws) => {
//   //     ws.getChannel("ch1").then((chan) => {
//   //       chan.subscribeToPosts("ws1", "ch1");
//   //     });
//   //   })
//   // })
// }

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

  // const model = getModel();
  // testUpdatePosts(model);

  // *Placeholder, testing code to ensure that we are listening for posts
  // correctly.*
  initAdapter();
  initView();

  // Redirect to homepage, if we just type in the URL
  if (window.location.hash == "") {
    window.location.hash = "#/home";
  }
  // example for how to use OOP model for posts
  // getModel().getWorkspace("this_workspace").getChannel("channel").getPost("")
}

function viewPostConverter(modelPost: ModelPost): ViewPost {
  return {
    Msg: modelPost.getResponse().doc.msg,
    Reactions: modelPost.getResponse().doc.reactions,
    Extensions: modelPost.getResponse().doc.extensions,
    CreatedUser: modelPost.getResponse().meta.createdBy,
    PostTime: modelPost.getResponse().meta.createdAt,
    Children: new Array<ViewPost>(),
  };
}

// Function that converts a tree of modelposts into an array of Viewposts.
// Viewposts will form a tree-like structure for posts.
export function getViewPosts(
  modelPostRoots: Map<string, ModelPost>
): Array<ViewPost> {
  // let sortedPosts = modelPosts.toSorted((a, b) => a.Path.split("/")[])
  let viewPostRoots = new Array<ViewPost>();
  getViewPostsHelper(viewPostRoots, modelPostRoots);
  return viewPostRoots;
}

// modifies curViewPost inplace
function getViewPostsHelper(
  viewPostChildren: Array<ViewPost>,
  modelPostChildren: Map<string, ModelPost>
): void {
  let modelPostChildrenArr = Array.from(modelPostChildren.values());
  modelPostChildrenArr.sort((a, b) =>
    a.getResponse().meta.createdAt < b.getResponse().meta.createdAt
      ? -1
      : a.getResponse().meta.createdAt > b.getResponse().meta.createdAt
      ? 1
      : 0
  );
  for (let modelPostChild of modelPostChildrenArr) {
    let viewPostChild = viewPostConverter(modelPostChild);
    getViewPostsHelper(viewPostChild.Children, modelPostChild.getReplies());
    viewPostChildren.push(viewPostChild);
  }
}

/* Register event handler to run after the page is fully loaded. */
document.addEventListener("DOMContentLoaded", () => {
  main();
});

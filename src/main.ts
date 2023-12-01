import { initAdapter } from "./adapter/init";
import { ModelPost } from "./model/post";
import { slog } from "./slog";
import {
  LogoutEvent,
  SelectChannelEvent,
  SelectWorkspaceEvent,
  ViewPost,
  ReactionUpdateEvent,
  CreateWorkspaceEvent,
  CreateChannelEvent,
  DeleteWorkspaceEvent,
  DeleteChannelEvent,
  CreatePostEvent,
} from "./view/datatypes";
import { LoginEvent } from "./view/datatypes";
import { initView } from "./view/init";
import { ModelPostEvent, PostsEvent } from "./model/modelTypes";
import { getView } from "./view/view";
import setupTestDb from "./tests/setup-test-db";
import { setupBasicApp } from "./tests/setup-additional-state";

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
    logoutEvent: CustomEvent<LogoutEvent>;
    workspaceSelected: CustomEvent<SelectWorkspaceEvent>;
    channelSelected: CustomEvent<SelectChannelEvent>;
    reactionUpdateEvent: CustomEvent<ReactionUpdateEvent>;
    workspaceCreated: CustomEvent<CreateWorkspaceEvent>;
    channelCreated: CustomEvent<CreateChannelEvent>;
    workspaceDeleted: CustomEvent<DeleteWorkspaceEvent>;
    channelDeleted: CustomEvent<DeleteChannelEvent>;
    createPostEvent: CustomEvent<CreatePostEvent>;
    modelPostEvent: CustomEvent<ModelPostEvent>;
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

  // Set up test DB.
  // TODO: Remove before submitting
  // setupTestDb();
  setupBasicApp();

  initAdapter();
  initView();

  getView().setHomePage();
  getView().setChatPage();
}

function viewPostConverter(modelPost: ModelPost): ViewPost {
  return {
    msg: modelPost.getResponse().doc.msg,
    reactions: modelPost.getResponse().doc.reactions,
    extensions: modelPost.getResponse().doc.extensions,
    createdUser: modelPost.getResponse().meta.createdBy,
    postTime: modelPost.getResponse().meta.createdAt,
    children: new Array<ViewPost>(),
    path: modelPost.getResponse().path,
    parent: modelPost.getResponse().doc.parent,
  };
}

// Function that converts a tree of modelposts into an array of Viewposts.
// Viewposts will form a tree-like structure for posts.
export function getViewPosts(
  modelPostRoots: Array<ModelPost>,
): Array<ViewPost> {
  // let sortedPosts = modelPosts.toSorted((a, b) => a.Path.split("/")[])
  let viewPostRoots = new Array<ViewPost>();
  getViewPostsHelper(viewPostRoots, modelPostRoots);
  return viewPostRoots;
}

// modifies curViewPost inplace
function getViewPostsHelper(
  viewPostChildren: Array<ViewPost>,
  modelPostRoots: Array<ModelPost>,
): void {
  modelPostRoots.sort((a, b) =>
    a.getResponse().meta.createdAt < b.getResponse().meta.createdAt
      ? -1
      : a.getResponse().meta.createdAt > b.getResponse().meta.createdAt
      ? 1
      : 0,
  );
  for (let modelPostChild of modelPostRoots) {
    let viewPostChild = viewPostConverter(modelPostChild);
    getViewPostsHelper(
      viewPostChild.children,
      Array.from(modelPostChild.getReplies().values()),
    );
    viewPostChildren.push(viewPostChild);
  }
}

/* Register event handler to run after the page is fully loaded. */
document.addEventListener("DOMContentLoaded", () => {
  main();
});

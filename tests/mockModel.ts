import { ChannelInterface, WorkspaceInterface } from "../src/interfaces";
import { ModelReactionUpdate } from "../src/model/modelTypes";
import { CreateResponse } from "../types/createResponse";

export class MockWorkspace {
  addChannel(channel_name: string) {
    return Promise.resolve();
  }
  removeChannel(channel_name: string) {
    return Promise.resolve();
  }
  getAllChannels(): Promise<Map<string, ChannelInterface>> {
    let mockChannel = new MockChannel("/workspacename/channels/channelname");
    let returnedMap = new Map<string, ChannelInterface>();
    returnedMap.set("channelname", mockChannel);
    return Promise.resolve(returnedMap);
  }
  getName(): string {
    return "workspacename";
  }
  getChannel(id: string): Promise<ChannelInterface> {
    let mockChannel = new MockChannel("/workspacename/channels/channelname");
    return Promise.resolve(mockChannel);
  }
}

export class MockChannel {
  path: string;

  constructor(path: string) {
    this.path = path;
  }
  getName() {
    return "channelname";
  }
  subscribeToPosts() {
    return;
  }
  unsubscribe() {
    return;
  }
  createPost(
    postContent: string,
    postParent: string,
    channelPath: string,
  ): Promise<CreateResponse> {
    return Promise.resolve({
      uri: "/v1/databasename/workspacename/channels/channelname/posts/post1",
    });
  }
}

export class MockModel {
  login(username: string) {
    if (username === "test_user") {
    }
    return Promise.resolve({
      token: "somerandomtoken",
    });
  }
  logout() {
    return Promise.resolve();
  }
  updateReaction(update: ModelReactionUpdate) {
    return Promise.resolve({
      uri: "/v1/databasename/workspacename/channels/channelname/posts/post1",
      patchFailed: false,
      message: "patches applied",
    });
  }
  addWorkspace(workspace_name: string) {
    return Promise.resolve();
  }
  removeWorkspace(workspace_name: string) {
    return Promise.resolve();
  }
  getAllWorkspaces() {
    // let mockWorkspace = new MockWorkspace();
    let returnedMap = new Map<string, WorkspaceInterface>();
    // returnedMap.set("workspacename", mockWorkspace);
    return Promise.resolve(returnedMap);
  }
  getWorkspace(id: string): Promise<WorkspaceInterface> {
    return Promise.resolve(new MockWorkspace());
  }
}

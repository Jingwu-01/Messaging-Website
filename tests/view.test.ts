import { getView, View } from "../src/view/view";
import {
  ViewWorkspaceUpdate,
  ViewWorkspace,
  ViewChannel,
  ViewChannelUpdate,
  ViewUser,
  StateName,
} from "../src/view/datatypes";
import { slog } from "../src/slog";
import { jest, beforeAll, expect, test } from "@jest/globals";
let view: View;

const queriesToElements: Map<string, HTMLElement> = new Map<
  string,
  HTMLElement
>();

beforeAll(() => {
  slog.setLevel(slog.LevelWarn);
  // mock query selector
  const mockQuerySelector = jest.fn((query) => {
    return queriesToElements.get(query);
  });
  const mockQuerySelectorAll = jest.fn((query) => {
    let el = queriesToElements.get(query);
    let fragment = document.createDocumentFragment();
    if (el) {
      fragment.appendChild(el);
    } else {
    }
    return fragment.childNodes;
  });
  global.document.querySelector = mockQuerySelector;
  global.document.querySelectorAll = mockQuerySelectorAll;
  // setup snackbar display
  const snackbarDisplay = document.createElement("div");
  queriesToElements.set("#snackbar-display", snackbarDisplay);
  view = getView();
  view.openSnackbar = jest.fn();
});

test("Workspace listener receives updates", () => {
  expect.assertions(2);
  const workspaceUpdate: ViewWorkspaceUpdate = {
    affectedWorkspaces: [],
    allWorkspaces: [],
    op: "add",
  };

  const workspace: ViewWorkspace = {
    name: "test workspace",
  };

  const workspaceListener = {
    displayWorkspaces(ws: ViewWorkspaceUpdate) {
      expect(ws).toBe(workspaceUpdate);
    },
    displayOpenWorkspace(ws: ViewWorkspace | null) {
      expect(ws).toBe(workspace);
    },
  };

  view.displayWorkspaces(workspaceUpdate);
  view.displayOpenWorkspace(workspace);
  view.addWorkspaceListener(workspaceListener);
});

test("Channel listener receives updates", () => {
  expect.assertions(2);
  const channelUpdate: ViewChannelUpdate = {
    affectedChannels: [],
    allChannels: [],
    op: "add",
  };

  const channel: ViewChannel = {
    name: "test channel",
  };

  const channelListener = {
    displayChannels(ch: ViewChannelUpdate) {
      expect(ch).toBe(channelUpdate);
    },
    displayOpenChannel(ch: ViewChannel | null) {
      expect(ch).toBe(channel);
    },
  };

  view.displayChannels(channelUpdate);
  view.displayOpenChannel(channel);
  view.addChannelListener(channelListener);
});

test("User listener receives updates", () => {
  expect.assertions(1);
  const testUser: ViewUser = {
    username: "foo",
  };

  const userListener = {
    displayUser(user: ViewUser | null) {
      expect(user).toBe(testUser);
    },
  };

  view.displayUser(testUser);
  view.addUserListener(userListener);
});

test("Loading listener receives updates", () => {
  let receivedLoadingState = new Set<StateName>();
  let receivedEndLoadingState = new Set<StateName>();
  const loadingListener = {
    onLoading(state: StateName) {
      receivedLoadingState.add(state);
    },
    onEndLoading(state: StateName) {
      receivedEndLoadingState.add(state);
    },
  };
  view.addLoadingListener(loadingListener);
  const testEvent = new CustomEvent("test event", { detail: { id: "1" } });
  view.setStateLoadingUntil(
    ["channels", "posts", "user", "workspaces"],
    testEvent,
  );
  view.completeEvent(testEvent);
  expect(receivedLoadingState.size).toBe(4);
  expect(receivedEndLoadingState.size).toBe(4);
});

test("Wait for event function works", () => {
  expect.assertions(4);
  const testEvent = new CustomEvent("test event", { detail: { id: "1" } });
  const testErrorMsg = "error msg";
  view.waitForEvent("1", (event, error) => {
    expect(event).toBe(testEvent);
    expect(error).toBe(testErrorMsg);
  });
  view.failEvent(testEvent, testErrorMsg);
  const testEventSuccess = new CustomEvent("test event", {
    detail: { id: "2" },
  });
  view.waitForEvent("2", (event, error) => {
    expect(event).toBe(testEventSuccess);
    expect(error).toBe(undefined);
  });
  view.completeEvent(testEventSuccess);
});

// test("Display dialog works", () => {
//   expect.as
//   const editDialog = {
//     showModal() {
//       ;
//     },
//   };
//   queriesToElements.set("#test-dialog");
// });

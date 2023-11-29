import { getModel } from "../../model/model";
import { slog } from "../../slog";
import {
  SelectWorkspaceEvent,
  CreateWorkspaceEvent,
  DeleteWorkspaceEvent,
  ViewPostUpdate,
} from "../../view/datatypes";
import { getView } from "../../view/view";
import getAdapter from "../adapter";
import modelToViewChannels from "../channel/modelToViewChannels";
import modelToViewWorkspaces from "./modelToViewWorkspaces";

export function initWorkspaces() {
  document.addEventListener(
    "workspaceSelected",
    function (evt: CustomEvent<SelectWorkspaceEvent>) {
      slog.info(`Workspace selected: ${evt.detail.name}`);
      getAdapter()
        .setOpenWorkspace(evt.detail.name)
        .then(() => {
          slog.info("initWorkspaces", [
            "Opened Channel displaying view channels",
            "",
          ]);
          getAdapter()
            .getOpenWorkspace()
            ?.getAllChannels()
            .then((modelChannels) => {
              getView().displayChannels({
                allChannels: modelToViewChannels(modelChannels),
                op: "replace",
                affectedChannels: modelToViewChannels(modelChannels),
                cause: evt,
              });
            });
          let viewPostUpdate: ViewPostUpdate = {
            allPosts: [],
            op: "add",
            affectedPosts: [],
          };
          getView().displayPosts(viewPostUpdate);
        });
    }
  );
  document.addEventListener(
    "workspaceCreated",
    async (evt: CustomEvent<CreateWorkspaceEvent>) => {
      slog.info(`Workspace added: ${evt.detail.name}`);
      // TODO handle error if workspace wasn't added
      await getModel().addWorkspace(evt.detail.name);
      const workspaces = await getModel().getAllWorkspaces();
      getView().displayWorkspaces({
        allWorkspaces: modelToViewWorkspaces(workspaces),
        op: "replace",
        affectedWorkspaces: modelToViewWorkspaces(workspaces),
        cause: evt,
      });
      getView().completeEvent(evt);
    }
  );

  // Handle workspace deletion
  document.addEventListener(
    "workspaceDeleted",
    async (evt: CustomEvent<DeleteWorkspaceEvent>) => {
      slog.info(`Workspace deleted: ${evt.detail.name}`);
      // TODO handle promise rejection
      await getModel().removeWorkspace(evt.detail.name);
      const workspaces = await getModel().getAllWorkspaces();
      getView().displayWorkspaces({
        allWorkspaces: modelToViewWorkspaces(workspaces),
        op: "replace",
        affectedWorkspaces: modelToViewWorkspaces(workspaces),
        cause: evt,
      });
    }
  );
}

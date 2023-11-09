import { slog } from "../../slog";
import { SelectWorkspaceEvent } from "../../view/datatypes";
import getAdapter from "../adapter";

export function initWorkspaces() {
  document.addEventListener(
    "workspaceSelected",
    function (evt: CustomEvent<SelectWorkspaceEvent>) {
      slog.info(`Workspace selected: ${evt.detail.name}`);
      // TODO: change console.log to slog
      getAdapter().setOpenWorkspace(evt.detail.name).then(() => {
        slog.info("initWorkspaces", ["Opened Channel displaying view channels", ""])
        getAdapter().displayViewChannels();
    });
    }
  );
}

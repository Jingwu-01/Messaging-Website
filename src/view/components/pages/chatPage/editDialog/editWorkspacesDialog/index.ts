import EditDialogComponent from "..";
import {
  EventWithId,
  ViewWorkspace,
  ViewWorkspaceUpdate,
} from "../../../../../datatypes";
import { getView } from "../../../../../view";

// Edit-dialog that allows user to edit workspaces
export class EditWorkspacesDialogComponent extends EditDialogComponent {
  connectedCallback(): void {
    super.connectedCallback();
    let title = this.shadowRoot?.querySelector("#dialog-title");
    if (!title) {
      throw new Error("Could not find dialog title element");
    }
    title.innerHTML = "Edit Workspaces";
    getView().addWorkspaceListener(this);
  }

  displayOpenWorkspace(workspace: ViewWorkspace) {}

  displayWorkspaces(update: ViewWorkspaceUpdate) {
    this.setItems(update.allWorkspaces.map((ws) => ws.name));
  }

  getAddEvent(new_item_name: string): EventWithId {
    let event_id = String(Date.now());
    return new CustomEvent("workspaceCreated", {
      detail: {
        name: new_item_name,
        id: event_id,
      },
    });
  }

  getRemoveEvent(workspace_name: string): EventWithId {
    let event_id = String(Date.now());
    return new CustomEvent("workspaceDeleted", {
      detail: {
        name: workspace_name,
        id: event_id,
      },
    });
  }
}

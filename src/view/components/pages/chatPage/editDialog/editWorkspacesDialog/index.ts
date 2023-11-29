import EditDialogComponent from "..";
import { ViewWorkspace, ViewWorkspaceUpdate } from "../../../../../datatypes";
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

  public onAdd(new_item_name: string): void {
    let event_id = String(Date.now());
    document.dispatchEvent(
      new CustomEvent("workspaceCreated", {
        detail: {
          name: new_item_name,
          id: event_id,
        },
      })
    );
    this.addItemButton.setAttribute("loading-until-event", event_id);
    this.saveAndCloseButton.setAttribute("disabled-until-event", event_id);
  }

  public onRemove(workspace_name: string): void {
    document.dispatchEvent(
      new CustomEvent("workspaceDeleted", {
        detail: {
          name: workspace_name,
        },
      })
    );
  }
}

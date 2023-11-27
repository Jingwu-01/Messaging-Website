import EditDialogComponent from "..";
import { ViewWorkspace } from "../../../../../datatypes";
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

  displayWorkspaces(workspaces: Array<ViewWorkspace>) {
    this.setItems(workspaces.map((ws) => ws.name));
  }

  public onAdd(new_item_name: string): void {
    document.dispatchEvent(
      new CustomEvent("workspaceCreated", {
        detail: {
          name: new_item_name,
        },
      })
    );
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

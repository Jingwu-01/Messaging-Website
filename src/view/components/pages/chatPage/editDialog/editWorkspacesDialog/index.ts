import EditDialogComponent from "..";
import {
  EventWithId,
  ViewWorkspace,
  ViewWorkspaceUpdate,
} from "../../../../../datatypes";
import { getView } from "../../../../../view";

/**
 * Edit-dialog that allows user to edit workspaces
 */
export class EditWorkspacesDialogComponent extends EditDialogComponent {
  /**
   * When connected, show edit workspace text and add workspace listner in the view. 
   */
  connectedCallback(): void {
    super.connectedCallback();
    let title = this.shadowRoot?.querySelector("#dialog-title");
    if (!title) {
      throw new Error("Could not find dialog title element");
    }
    title.innerHTML = "Edit Workspaces";
    getView().addWorkspaceListener(this);
  }

  /**
   * Display the open workspace. 
   * @param workspace ViewWorkspace
   */
  displayOpenWorkspace(workspace: ViewWorkspace) {}

  /**
   * Display the workspaces. 
   * @param update ViewWorkspaceUpdate
   */
  displayWorkspaces(update: ViewWorkspaceUpdate) {
    this.setItems(update.allWorkspaces.map((ws) => ws.name));
  }

  /**
   * get the add workspace event  
   * @param new_item_name string for the new worksapce
   * @returns EventWithId
   */
  getAddEvent(new_item_name: string): EventWithId {
    let event_id = String(Date.now());
    return new CustomEvent("workspaceCreated", {
      detail: {
        name: new_item_name,
        id: event_id,
      },
    });
  }

  /**
   * get the remove workspace event. 
   * @param workspace_name string for the removed worksapce
   * @returns EventWithId
   */
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

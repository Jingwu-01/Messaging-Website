import { ViewWorkspace } from "../../../../../datatypes";
import { getView } from "../../../../../view";
import EditDialogComponent from "../../editDialog";

// Displays username, handles logout.
class WorkspaceMenuComponent extends HTMLElement {
  private editDialog: EditDialogComponent;
  private editWorkspacesButton: HTMLButtonElement;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#workspace-menu-component-template"
    );
    if (!template) {
      throw Error("Could not find template #workspace-menu-component-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));

    let edit_dialog_query = this.shadowRoot?.querySelector("#edit-dialog");
    if (!(edit_dialog_query instanceof EditDialogComponent)) {
      throw Error("Could not find element with id #edit-dialog");
    }
    this.editDialog = edit_dialog_query;

    let edit_workspaces_button_query = this.shadowRoot?.querySelector(
      "#edit-workspaces-button"
    );
    if (!(edit_workspaces_button_query instanceof HTMLButtonElement)) {
      throw Error("Could not find element with id #edit-dialog");
    }

    this.editWorkspacesButton = edit_workspaces_button_query;
  }

  connectedCallback(): void {
    // The browser calls this when the element is added to a document.

    // Setup events for edit dialog
    this.editDialog.onAdd = (new_item_name: string) => {
      // TODO: make this send something to the adapter, which should then add a workspace to the db.
      // Additional idea: this should become the selected workspace, and maybe the dialog should close.
    };

    this.editDialog.onRemove = (item_id: string) => {
      // TODO: make this send something to the adapter
    };

    // make the edit workspaces button show the modal
    this.editWorkspacesButton.addEventListener("click", () => {
      this.editDialog.showModal();
    });

    // Tell the view that this component wants to listen to workspace updates
    getView().addWorkspaceListener(this);
  }

  disconnectedCallback(): void {
    // The browser calls this when the element is removed from a document.
    // TODO remove workspace listener.
  }

  // called by view whenever there is a change in the open workspace
  displayOpenWorkspace(workspace: ViewWorkspace | null) {
    // update the displayed open workspace
    let open_workspace_el = this.shadowRoot?.querySelector(
      "#open-workspace-text"
    );
    // Default to "Select Workspace" text if there is no workspace.
    if (open_workspace_el instanceof HTMLElement) {
      open_workspace_el.innerHTML = workspace
        ? workspace.name
        : "Select Workspace";
    }
  }

  // called by view whenever there is a change in the workspaces
  // create text for all of the workspaces and display them
  displayWorkspaces(workspaces: Array<ViewWorkspace>) {
    let workspace_menu_items_el = this.shadowRoot?.querySelector(
      "#workspace-menu-items"
    );
    if (workspace_menu_items_el instanceof HTMLElement) {
      // loop through, creating a new HTML element to display each workspace
      let new_inner_html = "";
      workspaces.forEach((workspace, i) => {
        new_inner_html += `
          <p id="workspace-select-${i}">${workspace.name}</p>
        `;
      });
      // update the document
      workspace_menu_items_el.innerHTML = new_inner_html;
      // give every element we just added a click listener
      workspaces.forEach((workspace, i) => {
        this.shadowRoot
          ?.querySelector(`#workspace-select-${i}`)
          ?.addEventListener("click", () => {
            // when the element is clicked, dispatch an event so that the adapter knows to change
            // the selected workspace.
            document.dispatchEvent(
              new CustomEvent("workspaceSelected", {
                detail: { name: workspace.name },
              })
            );
          });
      });
    }
    // tell the edit dialog to render these workspaces
    this.editDialog.setItems(workspaces.map((ws) => ws.name));
  }
}

export default WorkspaceMenuComponent;

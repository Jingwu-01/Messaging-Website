import { ViewWorkspace, ViewWorkspaceUpdate } from "../../../../../datatypes";
import { getView } from "../../../../../view";

/**
 *  WorkspaceMenu Component displays the workspaces.
 */
class WorkspaceMenuComponent extends HTMLElement {
  /** The workspace menu. */
  private menu: HTMLElement;
  /** Refresh workspace button */
  private refreshWorkspacesButton: HTMLElement;

  /**
   * Construtor for workspace menu.
   */
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

    let menu_query = this.shadowRoot?.querySelector("#menu");
    if (!(menu_query instanceof HTMLElement)) {
      throw Error("Could not find element #menu");
    }
    this.menu = menu_query;

    let refresh_workspaces_button_query = this.shadowRoot?.querySelector(
      "#refresh-workspaces-button"
    );
    if (!(refresh_workspaces_button_query instanceof HTMLElement)) {
      throw Error("Could not find element #refresh-workspaces-button");
    }
    this.refreshWorkspacesButton = refresh_workspaces_button_query;
  }

  /**
   * When connected, add event listeners for refresh button and then dispatch
   * event.
   */
  connectedCallback(): void {
    // The browser calls this when the element is added to a document.
    // Set up the "Refresh Workspaces" button
    this.refreshWorkspacesButton.addEventListener("click", () => {
      let event_id = String(Date.now());
      this.refreshWorkspacesButton.setAttribute(
        "loading-until-event",
        event_id
      );
      document.dispatchEvent(
        new CustomEvent("refreshWorkspaces", {
          detail: {
            id: event_id,
          },
        })
      );
    });

    // Tell the view that this component wants to listen to workspace updates
    getView().addWorkspaceListener(this);
  }

  /**
   * When disconnected, remove the workspace listener.
   */
  disconnectedCallback(): void {
    // TODO remove workspace listener.
  }

  /**
   * Called by view whenever there is a change in the open workspace.
   */
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

  /**
   * Called by view whenever there is a change in the workspaces
   * create text for all of the workspaces and display them
   */
  displayWorkspaces(update: ViewWorkspaceUpdate) {
    const workspaces = update.allWorkspaces;
    let workspace_menu_items_el = this.shadowRoot?.querySelector(
      "#workspace-menu-items"
    );
    if (workspace_menu_items_el instanceof HTMLElement) {
      // loop through, creating a new HTML element to display each workspace
      let new_inner_html = "";
      if (update.allWorkspaces.length == 0) {
        new_inner_html = `No workspaces yet. Click "Edit Workspaces" to add one!`;
      } else {
        workspaces.forEach((workspace, i) => {
          new_inner_html += `
          <loading-button-component disable-if-state-loading="workspaces channels posts user" id="workspace-select-${i}" class="workspace-select" style="background: none; border: none;" >
            <p slot="content">${workspace.name}</p>
          </loading-button-component>
          `;
        });
      }
      // update the document
      workspace_menu_items_el.innerHTML = new_inner_html;
      // give every element we just added a click listener
      workspaces.forEach((workspace, i) => {
        let workspace_item_el = this.shadowRoot?.querySelector(
          `#workspace-select-${i}`
        );

        workspace_item_el?.addEventListener("click", () => {
          // when the element is clicked, change the workspace in the adapter

          let event_id = String(Date.now());
          // Set the button we pressed to loading...
          workspace_item_el?.setAttribute("loading-until-event", event_id);

          document.dispatchEvent(
            new CustomEvent("workspaceSelected", {
              detail: { name: workspace.name, id: event_id },
            })
          );
          getView().waitForEvent(event_id, (event, err) => {
            // If we successfully selected a workspace, close the menu.
            if (!err) {
              this.menu.setAttribute("open", "false");
            }
          });
        });
      });
    }
  }
}

export default WorkspaceMenuComponent;

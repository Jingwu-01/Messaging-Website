import WorkspaceMenuComponent from ".";

/**
 * Initializes the workspace component HTML and register the custom element.
 */
export default function workspaceMenuComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="workspace-menu-component-template">
  <style>
    #dropdown-icon{
      font-size: 48px;
      color: white;
    }
    #workspace-menu-items{
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    #workspace-menu-anchor{
      display: flex;
      align-items: center;
    }
    #open-workspace-text{
      color: white;
    }
    #edit-workspaces-button{
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .divider{
      width: 100%;
      height: 1px;
      background-color: black;
      margin: 0 auto;
    }
    edit-dialog-component:hover {
      background-color: #3896b7; 
    }
    edit-dialog-component:active {
      background-color: #0f2831; 
      border-radius: 3px 3px 3px 3px;
    }
    p:hover {
      background-color: #3896b7; 
      border-radius: 5px 5px 5px 5px;
    }
    p:active {
      background-color: #0f2831; 
      border-radius: 3px 3px 3px 3px;
    }
    #center-button {
      background: none;
      color: inherit;
      border: none;
      padding: 0;
      font: inherit;
      cursor: pointer;
      outline: inherit;
      margin-top: 1em;
      margin-bottom: 1em;
    } 
    #center-button:focus-visible {
      box-shadow: #ff0000 0 0 0 3px;
      outline: none;
      border-radius: 5px 5px 5px 5px;
    }
    #center-button:focus:not(:focus-visible) {
      box-shadow: none;
      outline: none;
    }

  </style>
  <menu-component id="menu">
    <section id="workspace-menu-anchor" slot="anchor-el" display="inline-block">
      <button id="center-button"> 
        <p id="open-workspace-text">Select Workspace</p>
      </button>
      <iconify-icon id="dropdown-icon" icon="gridicons:dropdown" aria-label="open select workspace menu" role="button"></iconify-icon>
    </section>
    <section slot="menu-items" id="menu-items-wrapper">
      <section id="workspace-menu-items">
        No workspaces yet. Click "Edit Workspaces" to add one!
      </section>
      <section class="divider"></section>
      <loading-button-component disable-if-state-loading="workspaces user" id="refresh-workspaces-button" style="border: none; background: none;">
        <p slot="content">Refresh Workspaces</p>
        <iconify-icon icon="material-symbols:refresh" aria-label="Refresh Workspaces"></iconify-icon>
      </loading-button-component>
      <open-dialog-button-component dialog="edit-workspaces-dialog" style="border: none; background: none;">
        <section slot="button-content" id="edit-workspaces-button">
          <p>Edit Workspaces</p>
          <iconify-icon icon="material-symbols:edit" aria-label="Edit Workspaces"></iconify-icon>
        </section>
      </open-dialog-button-component>
    </section>
  </menu-component>
  <edit-dialog-component id="edit-dialog">
    <span slot="title">Edit Workspaces</span>
  </edit-dialog-component>
</template>
`,
  );

  customElements.define("workspace-menu-component", WorkspaceMenuComponent);
}

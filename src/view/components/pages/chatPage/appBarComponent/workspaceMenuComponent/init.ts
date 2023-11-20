import WorkspaceMenuComponent from ".";

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
  </style>
  <menu-component>
    <div id="workspace-menu-anchor" slot="anchor-el" display="inline-block">
      <p id="open-workspace-text">Select Workspace</p>
      <iconify-icon id="dropdown-icon" icon="gridicons:dropdown" aria-label="open select workspace menu"></iconify-icon>
    </div>
    <div slot="menu-items" id="menu-items-wrapper">
      <div id="workspace-menu-items">

      </div>
      <div class="divider"></div>
      <open-dialog-button-component dialog="edit-workspaces-dialog">
        <div slot="button-content" id="edit-workspaces-button">
          <p>Edit Workspaces</p>
          <iconify-icon icon="material-symbols:edit"></iconify-icon>
        </div>
      </open-dialog-button-component>
    </div>
  </menu-component>
  <edit-dialog-component id="edit-dialog">
    <span slot="title">Edit Workspaces</span>
  </edit-dialog-component>
</template>
`
  );

  customElements.define("workspace-menu-component", WorkspaceMenuComponent);
}

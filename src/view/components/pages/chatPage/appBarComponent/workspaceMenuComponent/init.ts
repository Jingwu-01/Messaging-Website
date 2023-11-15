import WorkspaceMenuComponent from ".";

export default function workspaceMenuComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="workspace-menu-component-template">
  <style>
    iconify-icon{
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
  </style>
  <menu-component>
    <div id="workspace-menu-anchor" slot="anchor-el" display="inline-block">
      <p id="open-workspace-text">Select Workspace</p>
      <iconify-icon icon="gridicons:dropdown" aria-label="user avatar"></iconify-icon>
    </div>
    <div slot="menu-items">
      <div id="workspace-menu-items">

      </div>
      <button id="edit-workspaces-button">Edit Workspaces</button>
    </div>
  </menu-component>
  <edit-dialog-component id="edit-dialog">
    <h2 slot="title">Edit Workspaces</h2>
  </edit-dialog-component>
</template>
`
  );

  customElements.define("workspace-menu-component", WorkspaceMenuComponent);
}

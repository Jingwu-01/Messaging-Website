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
  </style>
  <menu-component>
    <div id="workspace-menu-anchor" slot="anchor-el" display="inline-block">
      <p id="open-workspace-text"></p>
      <iconify-icon icon="gridicons:dropdown" aria-label="user avatar"></iconify-icon>
    </div>
    <div slot="menu-items">
      <div id="workspace-menu-items">

      </div>
    </div>
  </menu-component>
</template>
`
  );

  customElements.define("workspace-menu-component", WorkspaceMenuComponent);
}
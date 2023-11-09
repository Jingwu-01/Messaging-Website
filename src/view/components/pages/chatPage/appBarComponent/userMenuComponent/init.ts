import UserMenuComponent from ".";

export default function init() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="user-menu-component-template">
  <style>
    iconify-icon{
      font-size: 48px;
    }
    #user-menu-anchor{
      display: flex;
      align-items: center;
    }
  </style>
  <menu-component>
    <div id="user-menu-anchor" slot="anchor-el" display="inline-block">
      <iconify-icon icon="carbon:user-avatar-filled" aria-label="user avatar"></iconify-icon>
      <p id="user-text"></p>
    </div>
    <div slot="menu-items">
      <p id="logout-button">Log Out</p>
    </div>
  </menu-component>
</template>
`
  );

  customElements.define("user-menu-component", UserMenuComponent);
}

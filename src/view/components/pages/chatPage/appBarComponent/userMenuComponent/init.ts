import UserMenuComponent from ".";

/**
 * Initializes the userMenuComponent
 */
export default function init() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="user-menu-component-template">
  <style>
    iconify-icon{
      font-size: 48px;
      color: #11303b;
    }
    #user-menu-anchor{
      display: flex;
      align-items: center;
    }
    #user-menu-dropdown p:hover{
      background-color: #2e809c;
      border-radius: 5px 5px 5px 5px;
    }
    #user-menu-dropdown p:active{
      background-color: #0f2831; 
    }
    iconify-icon:hover {
      color: black;
    }
    iconify-icon:focus-visible {
      color: black;
    }
    
  </style>
  <menu-component>
    <div id="user-menu-anchor" slot="anchor-el" display="inline-block">
      <iconify-icon icon="carbon:user-avatar-filled" aria-label="user avatar" role="img"></iconify-icon>
      <p id="user-text"></p>
    </div>
    <div slot="menu-items" id="user-menu-dropdown">
      <p id="logout-button">Log Out</p>
    </div>
  </menu-component>
</template>
`,
  );

  customElements.define("user-menu-component", UserMenuComponent);
}

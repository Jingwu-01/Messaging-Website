import AppBarComponent from ".";

export default function appBarComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="app-bar-component-template">
  <style>
    #app-bar-wrapper{
      background-color: #26667C;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0px 10px;
    }
    #owl-icon{
      font-size: 48px;
    }
    h2{
      display: inline-block;
      color: white;
    }
    #title-wrapper{
      display: flex;
      align-items: center;
    }
  </style>
  <div id="app-bar-wrapper">
    <div id="title-wrapper">
      <span>
        <iconify-icon id="owl-icon" icon="noto-v1:owl" aria-label="m3ssag1ng owl"></iconify-icon>
      </span>
      <h2>Messaging</h2>
    </div>
    <workspace-menu-component></workspace-menu-component>
    <user-menu-component></user-menu-component>
  </div>
</template>
`
  );

  customElements.define("app-bar-component", AppBarComponent);
}
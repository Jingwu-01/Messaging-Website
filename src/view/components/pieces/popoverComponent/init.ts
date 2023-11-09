import PopoverComponent from ".";

export default function init() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="popover-component-template">
  <style>
    #wrapper {
      position: relative;
    }
    #popover-box {
      border-radius: 10px;
      padding: 10px;
      background-color: #add8e6;
    }
  </style>
  <div id="wrapper">
    <div>
      <slot name="anchor-el"></slot>
    </div>
    <div id="popover-box" style="position: absolute; top: 0; transform: translateY(-100%)" hidden>
      <slot name="popover-items"></slot>
    </div>
  </div>
</template>
`
  );

  customElements.define("popover-component", PopoverComponent);
}

import HoverComponent from ".";

export default function hoverComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="hover-component-template">
  <style>
  </style>
  <popover-component id="popover" align="top" open="false">
    <div slot="anchor-el" id="anchor-el-wrapper">
      <slot name="anchor-el"></slot>
    </div>
    <div slot="popover-items" id="popover-items-wrapper">
      <slot name="hover-items"></slot>
    </div>
  </popover-component>
</template>
`,
  );

  customElements.define("hover-component", HoverComponent);
}

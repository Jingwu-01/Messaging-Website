import HoverComponent from ".";

/**
 * Initialize the HTML template for hover component and register the hover
 * component custom element.
 */
export default function hoverComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="hover-component-template">
  <style>
  </style>
  <popover-component id="popover" align="top" open="false">
    <section slot="anchor-el" id="anchor-el-wrapper">
      <slot name="anchor-el" id="hovered-content"></slot>
    </section>
    <section slot="popover-items" id="popover-items-wrapper">
      <slot name="hover-items"></slot>
    </section>
  </popover-component>
</template>
`,
  );

  customElements.define("hover-component", HoverComponent);
}

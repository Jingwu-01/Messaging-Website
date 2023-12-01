import MenuComponent from ".";

export default function init() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <template id="menu-component-template">
    <style></style>
    <popover-component id="popover" align="bottom" open="false">
      <div slot="anchor-el" id="anchor-el-wrapper">
        <slot name="anchor-el"></slot>
      </div>
      <div slot="popover-items">
        <slot name="menu-items"></slot>
      </div>
    </popover-component>
  </template>
  
`,
  );

  customElements.define("menu-component", MenuComponent);
}

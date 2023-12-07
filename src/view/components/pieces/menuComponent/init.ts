import MenuComponent from ".";

/* Initialize the HTML template for menu component and register the menu  custom element. */
export default function init() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <template id="menu-component-template">
    <style></style>
    <popover-component id="popover" align="bottom" open="false">
      <section slot="anchor-el" id="anchor-el-wrapper">
        <slot name="anchor-el"></slot>
      </section>
      <section slot="popover-items">
        <slot name="menu-items"></slot>
      </section>
    </popover-component>
  </template>
  
`,
  );

  customElements.define("menu-component", MenuComponent);
}

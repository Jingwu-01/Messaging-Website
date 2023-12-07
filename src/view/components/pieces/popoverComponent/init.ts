import PopoverComponent from ".";

/**
 * Initializes the HTML template for popover component and register the popover
 * component custom element.
 */
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
    <section id="wrapper">
      <section>
        <slot name="anchor-el"></slot>
      </section>
      <section
        id="popover-box"
        style="position: absolute; top: 0; transform: translateY(-100%)"
        hidden
      >
        <slot name="popover-items"></slot>
      </section>
    </section>
  </template>
`,
  );

  customElements.define("popover-component", PopoverComponent);
}

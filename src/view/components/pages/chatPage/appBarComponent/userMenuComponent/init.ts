import UserMenuComponent from ".";

/**
 * Initialize the userMenuComponent by inserting its html template and registering the custom element. 
 */
export default function init() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
  <template id="user-menu-component-template">
    <style>
      iconify-icon {
        font-size: 48px;
        color: white;
      }
      #user-menu-anchor {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      #user-menu-dropdown p:active {
        background-color: #0f2831;
      }
      #user-text {
        color: white;
      }
      p:hover {
        background-color: #3896b7;
        border-radius: 5px 5px 5px 5px;
      }
      .user-buttons {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: inherit;
        margin-top: 2px;
      }
      .user-buttons:focus-visible {
        box-shadow: #ff0000 0 0 0 3px;
        outline: none;
        border-radius: 10px;
      }
      .user-buttons:focus:not(:focus-visible) {
        box-shadow: none;
        outline: none;
      }
      #user-menu-dropdown {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    </style>
    <menu-component id="menu">
      <button
        class="user-buttons"
        id="user-menu-anchor"
        slot="anchor-el"
        display="inline-block"
      >
        <iconify-icon
          icon="carbon:user-avatar-filled"
          aria-label="user avatar"
          role="img"
        ></iconify-icon>
        <p id="user-text"></p>
        <iconify-icon
          icon="gridicons:dropdown"
          aria-label="user dropdown"
          role="img"
        ></iconify-icon>
      </button>
      <section slot="menu-items" id="user-menu-dropdown">
        <button class="user-buttons">
          <p id="my-starred-posts-button">My Starred Posts</p>
        </button>
        <loading-button-component
          disable-if-state-loading="user"
          class="user-buttons"
          id="logout-button"
          style="background: none; border: none"
        >
          <p slot="content">Log Out</p>
        </loading-button-component>
      </section>
    </menu-component>
  </template>
`
  );

  customElements.define("user-menu-component", UserMenuComponent);
}

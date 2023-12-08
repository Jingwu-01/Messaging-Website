import { ChannelSidebar } from "./index";

/**
 * Init channel side bar component by inserting its html elment and registering its custom element.
 */
export default function channelSidebarComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <template id="channel-sidebar-component-template">
    <style>
      #channel-containner {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }
      #channel-list {
        list-style-type: none;
        margin-top: 0em;
        width: max(10vw, 80px);
        padding: 10px 10px;
      }
      .selected-channel {
        color: white;
        background-color: #26667c;
      }
      #button-wrapper {
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 10px;
      }
      .button-content {
        display: flex;
        align-items: center;
        gap: 10px;
        background-color: #26667c;
        border-radius: 10px 10px 10px 10px;
        color: white;
        padding: 0 10px;
      }
      .button-content:hover {
        background-color: #163d4a;
      }
      .button-content:active {
        background-color: #0f2831;
      }
      section button {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        margin-top: 1em;
        margin-bottom: 1em;
        font-size: 17px;
        border-radius: 5px 5px 5px 5px;
        display: block;
        width: 100%;
      }
      section button:disabled {
        color: LightGray;
      }
      section button:hover {
        background-color: #3896b7;
      }
      section button:active {
        background-color: #163d4a;
      }
      section button:focus-visible {
        box-shadow: #ff0000 0 0 0 3px;
        outline: none;
        border-radius: 5px 5px 5px 5px;
      }
      section button:focus:not(:focus-visible) {
        box-shadow: none;
        outline: none;
      }
    </style>
    <section id="channel-containner">
      <section id="channel-list"></section>
      <section id="button-wrapper">
        <loading-button-component
          id="refresh-channels-button"
          style="background: none; border: none"
          disable-if-state-loading="channels workspaces user"
        >
          <section slot="content" class="button-content">
            <p>Refresh Channels</p>
            <iconify-icon
              icon="material-symbols:refresh"
              aria-label="Refresh Channels"
            ></iconify-icon>
          </section>
        </loading-button-component>
        <open-dialog-button-component
          dialog="edit-channels-dialog"
          style="border: none; background: none"
        >
          <section
            slot="button-content"
            id="edit-channels-button-content"
            class="button-content"
          >
            <p>Edit Channels</p>
            <iconify-icon
              icon="material-symbols:edit"
              aria-label="Edit Channels"
            ></iconify-icon>
          </section>
        </open-dialog-button-component>
      </section>
    </section>
  </template>
  
`
  );
  // an example channel element looks like:
  // <li id="channel-select-{channel-name}">{channel-name}</li>
  // and a selected channel should look like:
  // <li id="channel-select-{channel-name}" class="selected-channel">{channel-name}</li>

  customElements.define("channel-sidebar-component", ChannelSidebar);
}

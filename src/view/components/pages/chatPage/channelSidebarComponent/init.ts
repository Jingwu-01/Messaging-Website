import { ChannelSidebar } from "./index";

export default function channelSidebarComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="channel-sidebar-component-template">
    <style>
    .selected-channel {
        color: white;
        background-color: #26667C;
    }
    ul {
        list-style-type: none;
        margin-top: 0em;
        width: max(10vw, 80px);
        padding: 10px 10px;
    }
    li {
        margin-top: 1em;
        margin-bottom: 1em;
        font-size: 17px;
        border-radius: 5px 5px 5px 5px;
    }
    #edit-channels-button-wrapper{
        text-align: center;
    }
    #edit-channels-button-content{
        display: flex;
        align-items: center;
        gap: 10px;
        background-color: #26667C;
        border-radius: 10px 10px 10px 10px;
        color: white;
        padding: 0 10px;
    }
    #edit-channels-button-content:hover{
        background-color: #163d4a; 
    }
    #edit-channels-button-content:active{
        background-color: #0f2831; 
    }
    #edit-channels-button-wrapper:focus-visible {
        box-shadow: #FF0000 0 0 0 3px;
        outline: none;
    }
    #edit-channels-button-wrapper:focus:not(:focus-visible) {
        box-shadow: none;
        outline: none;
    } 
    li:hover {
        background-color: #3896b7; 
    }
    li:active {
        background-color: #163d4a; 
    }
    </style>
    <ul id="channel-list"></ul>
    <section id="edit-channels-button-wrapper">
        <open-dialog-button-component dialog="edit-channels-dialog">
            <section slot="button-content" id="edit-channels-button-content">
                <p>Edit Channels</p>
                <iconify-icon icon="material-symbols:edit"></iconify-icon>
            </section>
        </open-dialog-button-component>
    </section>
</template>
`,
  );
  // an example channel element looks like:
  // <li id="channel-select-{channel-name}">{channel-name}</li>
  // and a selected channel should look like:
  // <li id="channel-select-{channel-name}" class="selected-channel">{channel-name}</li>

  customElements.define("channel-sidebar-component", ChannelSidebar);
}

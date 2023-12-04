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
    }
    #button-wrapper{
        display: flex;
        align-items: center;
        flex-direction: column; 
        gap: 10px;
    }
    .button-content{
        display: flex;
        align-items: center;
        gap: 10px;
        background-color: #26667C;
        border-radius: 10px 10px 10px 10px;
        color: white;
        padding: 0 10px;
    }
    .button-content:hover{
        background-color: #163d4a; 
    }
    .button-content:active{
        background-color: #0f2831; 
    }
    li {
        font-size: 17px;
        border-radius: 5px 5px 5px 5px;
    }
    li:hover {
        background-color: #3896b7; 
    }
    li:active {
        background-color: #163d4a; 
    }
    </style>
    <ul id="channel-list">
    </ul>
    <div id="button-wrapper">
        <loading-button-component id="refresh-channels-button" style="background: none; border: none">
            <div slot="content" class="button-content">
                <p>Refresh Channels</p>
                <iconify-icon icon="material-symbols:refresh" aria-label="Refresh Channels"></iconify-icon>
            </div>
        </loading-button-component>
        <open-dialog-button-component dialog="edit-channels-dialog" style="border: none; background: none;">
            <div slot="button-content" id="edit-channels-button-content" class="button-content">
                <p>Edit Channels</p>
                <iconify-icon icon="material-symbols:edit" aria-label="Edit Channels"></iconify-icon>
            </div>
        </open-dialog-button-component>
    </div>
</template>
`
  );
  // an example channel element looks like:
  // <li id="channel-select-{channel-name}">{channel-name}</li>
  // and a selected channel should look like:
  // <li id="channel-select-{channel-name}" class="selected-channel">{channel-name}</li>

  customElements.define("channel-sidebar-component", ChannelSidebar);
}

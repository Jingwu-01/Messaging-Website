import {ChannelSidebar}  from "./index";

export default function channelDisplayComponentInit() {
    document.body.insertAdjacentHTML(
        "beforeend",
`
<template id="channel-display-template">
    <style>
    .selected-channel {
        text-color: white;
        background-color: #26667C;
    }
    </style>
    <ul id="channel-list">
    </ul>
</template>
`
    );
    // an example channel element looks like:
    // <li id="channel-select-{channel-name}">{channel-name}</li>
    // and a selected channel should look like:
    // <li id="channel-select-{channel-name}" class="selected-channel">{channel-name}</li>

    customElements.define("channel-sidebar-component", ChannelSidebar);
}


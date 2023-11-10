import {ChannelSidebar}  from "./index";

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
    }
    li {
        margin-top: 1em;
        margin-bottom: 1em;
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


import {ChannelSidebar}  from "./index";

export default function channelDisplayComponentInit() {
    document.body.insertAdjacentHTML(
        "beforeend",
`
<template id="channel-display-template">
    <ul id="channel-list">
    </ul>
</template>
`
    );

    customElements.define("channel-sidebar-component", ChannelSidebar);
}


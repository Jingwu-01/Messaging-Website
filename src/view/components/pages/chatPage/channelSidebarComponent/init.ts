import {ChannelSidebar}  from "./index";

export default function channelDisplayComponentInit() {
    document.body.insertAdjacentHTML(
        "beforeend",
`
<template id="channel-display-template">
    <section id="channel-container">
    </section>
</template>
`
    );

    customElements.define("channel-sidebar", ChannelSidebar);
}


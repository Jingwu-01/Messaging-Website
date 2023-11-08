import PostDisplay from ".";

export default function postDisplayComponentInit() {
    document.body.insertAdjacentHTML(
        "beforeend",
`
<template id="postdisplay-template">
    <h2 id="channel-name"></h2>
    <section id="posts-container">
    </section>
</template>
`
    );

    customElements.define("post-display", PostDisplay);
}


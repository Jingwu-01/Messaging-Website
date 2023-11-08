import ChatPost from ".";

export default function postComponentInit() {
    document.body.insertAdjacentHTML(
        "beforeend",
`
<template id="post-template">

    <!-- TODO: necessary: for each post, add a bit of margin left. -->
    <!-- This will display nested posts as we want. -->
    <section>
        <p id="post-header">
            <!-- TODO: change element type used here? -->
            <time id="post-time"></time>
        </p>
        <p id="post-body">    
            <!-- TODO: can also add additional HTML element(s) for buttons (reactions, replies)-->
        </p>
    </section>
</template>
`
    );

    customElements.define("chat-post", ChatPost);
}

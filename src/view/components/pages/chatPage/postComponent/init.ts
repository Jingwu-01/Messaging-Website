import Post from ".";

export default function postComponentInit() {
    document.body.insertAdjacentHTML(
        "beforeend",
`
<template id="post-template">

    <!-- TODO: necessary: for each post, add a bit of margin left. -->
    <!-- This will display nested posts as we want. -->
    <section>
        <header id="post-header">
        </header>
        <p id="post-body">    
            <!-- TODO: can also add additional HTML element(s) for buttons (reactions, replies)-->
        </p>
    </section>
</template>
`
    );

    customElements.define("post-component", Post);
}

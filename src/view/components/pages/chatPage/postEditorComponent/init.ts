import PostEditor from ".";

export default function postEditorInit() {
    document.body.insertAdjacentHTML{
        "beforeend",
        `
<template id="post-editor-template">
    <section id="post-editor-wrapper">
        <ul id="post-operations">
            <li id="smile-reaction">
        </ul>
    </section>
</template>
        `
    }
}
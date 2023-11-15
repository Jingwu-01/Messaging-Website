import { PostEditor } from ".";

export default function postEditorInit() {
    document.body.insertAdjacentHTML(
        "beforeend",
        `
<template id="post-editor-template">
    <style>
        #post-operations li {
            display: inline-block;
        }
        #post-operations {
            list-style-type: none;
            padding-left: 0em;
        }
        #post-editor-wrapper {
            display: flex;
            flex-direction: column;
            background-color: #ADD8E6;
            margin-left: 1em;
            padding-left: 1em;
            padding-right: 1em;
            padding-top: 1em;
            padding-bottom: 1em;
        }
        #post-form {
            display: flex;
            flex-direction: column;
        }
        #post-input {
            width: 20em;
            height: 5em;
        }
        #post-submit {
            margin-top: 1em;
            width: 25%;
        }

    </style>

    <section id="post-editor-wrapper">
        <ul id="post-operations">
            <li id="bold-text"><iconify-icon icon="octicon:bold-16" aria-label="bold"></iconify-icon></li>
            <li id="italicize-text"><iconify-icon icon="mingcute:italic-fill" aria-label="italicize"></iconify-icon></li>
            <li id="link-text"><iconify-icon icon="material-symbols:link" aria-label="link"></iconify-icon></li>
            <li id="smile-reaction"><iconify-icon icon="lucide:smile" aria-label="smile"></iconify-icon></li>
            <li id="frown-reaction"><iconify-icon icon="lucide:frown" aria-label="frown"></iconify-icon></li>
            <li id="like-reaction"><iconify-icon icon="mdi:like-outline" aria-label="like"></iconify-icon></li>
            <li id="celebrate-reaction"><iconify-icon icon="mingcute:celebrate-line" aria-label="celebrate"></iconify-icon></li>
        </ul>
        <form id="post-form">
            <textarea id="post-input" name="post_input"></textarea>
            <button type="submit" id="post-submit">Send<iconify-icon icon="tabler:send" aria-label="send"></iconify-icon>
        </form>
    </section>
</template>
        `
    );

    customElements.define("post-editor-component", PostEditor);
}
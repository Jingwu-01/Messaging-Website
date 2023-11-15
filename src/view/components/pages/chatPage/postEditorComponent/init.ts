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
            margin-top: 0em;
            margin-bottom: 0em;
        }
        #post-editor-wrapper {
            display: flex;
            flex-direction: column;
            background-color: #ADD8E6;
            margin-left: 1em;
            margin-right: 1em;
            padding-left: 1em;
            padding-right: 1em;
            padding-top: .5em;
            padding-bottom: .5em;
            border-radius: 10px;
        }
        #post-form {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
        }
        #post-input {
            height: 5em;
            resize: none;
        }
        #post-submit {
            margin-top: 1em;
            width: fit-content;
            display: flex;
            align-items: center;
            background-color: #26667C;
            color: #FFFFFF;
            border-radius: 1em;
        }
        #send-icon {
            margin-left: .5em;
        }
        #post-operations iconify-icon {
            font-size: 1.5em;
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
            <button type="submit" id="post-submit">Send<iconify-icon id="send-icon" icon="tabler:send" aria-label="send"></iconify-icon>
        </form>
    </section>
</template>
        `
    );

    customElements.define("post-editor-component", PostEditor);
}
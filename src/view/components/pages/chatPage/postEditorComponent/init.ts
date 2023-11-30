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
        li:hover {
            background-color: #3896b7; 
        }
        li:active {
            background-color: #163d4a; 
        }
        #post-submit:hover {
            background-color: #163d4a; 
        }
        #post-submit:active{
            background-color: #0f2831; 
        }
        

    </style>

    <section id="post-editor-wrapper">
        <ul id="post-operations">
            <li id="bold-text" aria-label="bold"><iconify-icon icon="octicon:bold-16"></iconify-icon></li>
            <li id="italicize-text" aria-label="italicize"><iconify-icon icon="mingcute:italic-fill"></iconify-icon></li>
            <li id="link-text" aria-label="link"><iconify-icon icon="material-symbols:link"></iconify-icon></li>
            <li id="smile-reaction" aria-label="smile"><iconify-icon icon="lucide:smile"></iconify-icon></li>
            <li id="frown-reaction" aria-label="frown"><iconify-icon icon="lucide:frown" ></iconify-icon></li>
            <li id="like-reaction" aria-label="like"><iconify-icon icon="mdi:like-outline"></iconify-icon></li>
            <li id="celebrate-reaction" aria-label="celebrate"><iconify-icon icon="mingcute:celebrate-line"></iconify-icon></li>
        </ul>
        <form id="post-form">
            <textarea id="post-input" name="post_input" aria-label="Type your post input"></textarea>
            <button type="submit" id="post-submit" aria-label="send">Send<iconify-icon id="send-icon" icon="tabler:send"></iconify-icon>
        </form>
    </section>
</template>
        `
    );

    customElements.define("post-editor-component", PostEditor);
}
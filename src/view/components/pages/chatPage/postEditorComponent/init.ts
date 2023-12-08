import { PostEditor } from ".";

/**
 * Initialize the post editor component by inserting its html template and registering its custom element.
 */
export default function postEditorInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="post-editor-template">
    <style>
        #post-editor-header {
            display: flex;
            flex-direction: row;
        }
        .editor-op--end {
            margin-left: auto;
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
        .reactions, #cancel-reply{
            width: 30px;
            height: 30px;
            border-radius: 3px 3px 3px 3px;
        }
        #cancel-reply:hover{
            background-color: #818589;
        }
        .reactions:hover {
            background-color: #3896b7; 
        }
        .reactions:active {
            background-color: #163d4a; 
        }
        #post-submit:hover {
            background-color: #163d4a; 
        }
        #post-submit:active {
            background-color: #0f2831; 
        }
        .reactions:focus-visible, #cancel-reply:focus-visible, #post-input:focus-visible {
            box-shadow: #FF0000 0 0 0 3px;
            outline: none;
            border-radius: 3px 3px 3px 3px;
        }
        #post-submit:focus-visible {
            box-shadow: #FF0000 0 0 0 3px;
            outline: none;
            border-radius: 1em;
        }
        .reactions:focus:not(:focus-visible), #cancel-reply:focus:not(:focus-visible),#post-input:focus:not(:focus-visible), #post-sumbit:focus:not(:focus-visible) {
            box-shadow: none;
            outline: none;
        } 
        .reactions {
            background: none; 
            color: inherit; 
            border: none; 
            padding: 0; 
            font: inherit; 
            cursor: pointer; 
            outline: inherit; 
          } 
    </style>

    <section id="post-editor-wrapper">
        <section id="post-editor-header">
            <section id="post-operations">
                <button class="reactions" id="bold-text" aria-label="bold" tabindex="0"><iconify-icon icon="octicon:bold-16"></iconify-icon></button>
                <button class="reactions" id="italicize-text" aria-label="italicize" tabindex="0"><iconify-icon icon="mingcute:italic-fill"></iconify-icon></button>
                <button class="reactions" id="link-text" aria-label="link" tabindex="0"><iconify-icon icon="material-symbols:link"></iconify-icon></button>
                <button class="reactions" id="smile-reaction" aria-label="smile" tabindex="0"><iconify-icon icon="lucide:smile"></iconify-icon></button>
                <button class="reactions" id="frown-reaction" aria-label="frown" tabindex="0"><iconify-icon icon="lucide:frown" ></iconify-icon></button>
                <button class="reactions" id="like-reaction" aria-label="like" tabindex="0"><iconify-icon icon="mdi:like-outline"></iconify-icon></button>
                <button class="reactions" id="celebrate-reaction" aria-label="celebrate" tabindex="0"><iconify-icon icon="mingcute:celebrate-line"></iconify-icon></button>
            </section>
            <button id="cancel-reply" class="editor-op--end" aria-label="cancel reply" role="button"><iconify-icon icon="octicon:x-12"></iconify-icon></button>
        </section>
        <form id="post-form">
            <textarea id="post-input" name="post_input" aria-label="Type your post input"></textarea>
            <button type="submit" id="post-submit" aria-label="send">
                Send
                <iconify-icon id="send-icon" icon="tabler:send"></iconify-icon>
            </button>
        </form>
    </section>
</template>
        `
  );

  customElements.define("post-editor-component", PostEditor);
}

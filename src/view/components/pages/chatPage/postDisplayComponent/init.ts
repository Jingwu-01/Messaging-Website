import PostDisplay from ".";

export default function postDisplayComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="postdisplay-template">
    <style>
        #posts-container{
            padding-left: 10px;
            padding-top: 10px
        }
        .post-children {
          margin-left: 5em;
        }
    </style>
    <h2 id="channel-name"></h2>
    <section id="posts-container">
    </section>
    <post-editor-component id="post-editor"></post-editor-component>
</template>
`
  );

  customElements.define("post-display-component", PostDisplay);
}

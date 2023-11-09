import ChatPage from ".";

// TODO: add styling here. below sidebar and post display needs to be
// in flexbox
export default function chatPageInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="chat-page-template">
  <style>
    
  </style>
  <div>
    <app-bar-component></app-bar-component>
    <channel-sidebar-component></channel-sidebar-component>
    <post-display-component></post-display-component>
  </div>
</template>
`
  );

  customElements.define("chat-page", ChatPage);
}

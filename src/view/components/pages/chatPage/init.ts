import ChatPage from ".";

// TODO: add styling here. below sidebar and post display needs to be
// in flexbox
export default function chatPageInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="chat-page-template">
  <style>
    main {
      display: flex;
    }
    channel-sidebar-component {
      background-color: #ADD8E6;
    }
  </style>
  <div>
    <app-bar-component></app-bar-component>
    <main>
      <channel-sidebar-component></channel-sidebar-component>
      <post-display-component></post-display-component>
    </main>
  </div>
</template>
`
  );

  customElements.define("chat-page", ChatPage);
}

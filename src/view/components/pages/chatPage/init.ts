import ChatPage from ".";

/**
 * Initializes the ChatPage component
 */
export default function chatPageInit() {
  // TODO: add styling here. below sidebar and post display needs to be
  // in flexbox
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="chat-page-template">
  <style>
    div {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    main {
      display: flex;
      align-items: stretch;
      flex: 1;
    }
    channel-sidebar-component {
      background-color: #ADD8E6;
      width: 17%;
    }
    post-display-component {
      width: 83%;
    }
  </style>
  <div>
    <app-bar-component></app-bar-component>
    <main>
      <channel-sidebar-component></channel-sidebar-component>
    </main>
  </div>
</template>
`,
  );

  customElements.define("chat-page", ChatPage);
}

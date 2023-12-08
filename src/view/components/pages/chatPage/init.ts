import ChatPage from ".";

/**
 * Initialize the ChatPage component by inserting its html template and registering its custom component.
 */
export default function chatPageInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="chat-page-template">
  <style>
    section {
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
  <section>
    <app-bar-component></app-bar-component>
    <main>
      <channel-sidebar-component></channel-sidebar-component>
    </main>
  </section>
</template>
`,
  );

  customElements.define("chat-page", ChatPage);
}

import ChatPage from ".";

export default function chatPageInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="chat-page-template">
  <style>
    
  </style>
  <div>
    <app-bar-component></app-bar-component>
  </div>
</template>
`
  );

  customElements.define("chat-page", ChatPage);
}

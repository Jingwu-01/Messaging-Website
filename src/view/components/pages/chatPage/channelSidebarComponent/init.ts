import { ChannelSidebar } from "./index";

export default function channelSidebarComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="channel-sidebar-component-template">
<style>
#channel-list {
  list-style-type: none;
  margin-top: 0em;
  width: max(10vw, 80px);
  padding: 10px 10px;
}
.selected-channel {
  color: white;
  background-color: #26667c;
}
#button-wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 10px;
}
.button-content {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #26667c;
  border-radius: 10px 10px 10px 10px;
  color: white;
  padding: 0 10px;
}
.button-content:hover {
  background-color: #163d4a;
}
.button-content:active {
  background-color: #0f2831;
}
section button:hover {
  background-color: #3896b7;
}
section button:active {
  background-color: #163d4a;
}
section button {
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  margin-top: 1em;
  margin-bottom: 1em;
  font-size: 17px;
  border-radius: 5px 5px 5px 5px;
  width: 100%;
}
section button:focus-visible {
  box-shadow: #ff0000 0 0 0 3px;
  outline: none;
  border-radius: 5px 5px 5px 5px;
}
section button:focus:not(:focus-visible){
  box-shadow: none;
  outline: none;
}
</style>
    
    <section id="channel-list"></section>
    <div id="button-wrapper">
        <loading-button-component id="refresh-channels-button" style="background: none; border: none">
            <div slot="content" class="button-content">
                <p>Refresh Channels</p>
                <iconify-icon icon="material-symbols:refresh" aria-label="Refresh Channels"></iconify-icon>
            </div>
        </loading-button-component>
        <open-dialog-button-component dialog="edit-channels-dialog" style="border: none; background: none;">
            <div slot="button-content" id="edit-channels-button-content" class="button-content">
                <p>Edit Channels</p>
                <iconify-icon icon="material-symbols:edit" aria-label="Edit Channels"></iconify-icon>
            </div>
        </open-dialog-button-component>
    </section>
</template>
`
  );
  // an example channel element looks like:
  // <li id="channel-select-{channel-name}">{channel-name}</li>
  // and a selected channel should look like:
  // <li id="channel-select-{channel-name}" class="selected-channel">{channel-name}</li>

  customElements.define("channel-sidebar-component", ChannelSidebar);
}

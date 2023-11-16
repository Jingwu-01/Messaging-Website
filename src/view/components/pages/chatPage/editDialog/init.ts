import EditDialogComponent from ".";

export default function editDialogComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="edit-dialog-component-template">
  <style>
    form {
      display: inline-block;
    }
    .item {
      display: flex;
    }
    #dialog-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  </style>
  <dialog id="dialog">
    <div id="dialog-content">
      <slot name="title"></slot>
      <div id="item-display"></div>
      <form id="add-item-form">
        <input type="text" id="add-item-input" name="new-item-name" required />
        <input type="submit">Add</input>
      </form>
      <button id="save-and-close-button">Save and Close</button>
    </div>
  </dialog>
</template>
`
  );

  customElements.define("edit-dialog-component", EditDialogComponent);
}

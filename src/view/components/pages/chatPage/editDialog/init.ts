import EditDialogComponent from ".";
import editChannelsDialogComponentInit from "./editChannelsDialog/init";
import editWorkspacesDialogComponentInit from "./editWorkspacesDialog/init";

/**
 * Initializes the EditDialog component
 */
export default function editDialogComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="edit-dialog-component-template">
  <style>
    #add-item-form {
      display: inline-block;
    }
    .item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.25rem;
    }
    #dialog-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    iconify-icon[icon="material-symbols:delete"]:hover {
      color: #26667C;
    }
    dialog {
      background-color: #add8e6;
      text-align: center;
      border: none;
      box-shadow: #00000029 2px 2px 5px 2px;
      border-radius: 10px;
    }
  </style>
  <dialog id="dialog">
    <div id="dialog-content">
      <h2 id="dialog-title"></h2>
      <div id="item-display"></div>
      <div id="add-item-form">
        <input type="text" id="add-item-input" arial-label="Your input"/>
        <loading-button-component 
          id="add-item-button"
        >
          <span slot="content">
            Add
          </span>
        </loading-button-component>
      </div>
      <loading-button-component id="save-and-close-button">
        <span slot="content">
          Save and Close
        </span>
      </loading-button-component>
    </div>
  </dialog>
</template>
`
  );

  customElements.define("edit-dialog-component", EditDialogComponent);

  editWorkspacesDialogComponentInit();
  editChannelsDialogComponentInit();
}

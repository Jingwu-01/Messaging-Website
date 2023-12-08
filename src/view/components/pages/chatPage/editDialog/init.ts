import EditDialogComponent from ".";
import editChannelsDialogComponentInit from "./editChannelsDialog/init";
import editWorkspacesDialogComponentInit from "./editWorkspacesDialog/init";

/**
 * Initialize the EditDialog component.
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
    #add-item-input:focus-visible{
      box-shadow: #FF0000 0 0 0 3px;
      outline: none;
      border-radius: 5px;
    }
  </style>
  <dialog id="dialog">
    <section id="dialog-content">
      <h2 id="dialog-title"></h2>
      <section id="item-display"></section>
      <section id="add-item-form">
        <input type="text" id="add-item-input" arial-label="Your input"/>
        <loading-button-component 
          id="add-item-button"
        >
          <span slot="content">
            Add
          </span>
        </loading-button-component>
      </section>
      <loading-button-component disable-if-state-loading="workspaces channels" id="save-and-close-button">
        <span slot="content">
          Save and Close
        </span>
      </loading-button-component>
    </section>
  </dialog>
</template>
`
  );

  customElements.define("edit-dialog-component", EditDialogComponent);

  editWorkspacesDialogComponentInit();
  editChannelsDialogComponentInit();
}

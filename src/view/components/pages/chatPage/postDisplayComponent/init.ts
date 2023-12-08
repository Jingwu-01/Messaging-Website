import PostDisplay from ".";

/**
 * Init post display component by inserting the html template and register the custom element.
 */
export default function postDisplayComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="postdisplay-template">
    <style>
        #postdisplay-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          height: 100%;
        }
        #posts-container{
            padding-left: 10px;
            padding-top: 10px
        }
        .post-children {
          margin-left: 5em;
        }
    </style>
    <section id="postdisplay-wrapper">
      <section id="posts-container">
      </section>
    </section>
</template>
`,
  );

  customElements.define("post-display-component", PostDisplay);
}

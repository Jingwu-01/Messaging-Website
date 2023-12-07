import StarredPosts from ".";

/**
 * Initialize the starredPosts component by inserting its html template and registering its custom element.
 */
export default function starredPostsComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="starredposts-template">
    <style>
        #starredposts-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        #posts-container{
            padding-left: 10px;
            padding-top: 10px
        }
        .post-children {
          margin-left: 5em;
        }
        #starred-posts-dialog {
          border: 1px solid #000;
          padding: 10px;
          width: 500px;
          left: 50%;
          background-color: white;
          border-radius: 5px;
        }
        #close-starred-posts:focus-visible {
          box-shadow: #FF0000 0 0 0 3px;
          outline: none;
        }
        #close-starred-posts:focus:not(:focus-visible) {
          box-shadow: none;
          outline: none;
        }
        #close-starred-posts {
          width: 30px;
          height: 30px;
          border-radius: 3px 3px 3px 3px;
        }
        #close-starred-posts:hover {
          background-color: #818589;
        }
        #close-starred-posts:active {
          background-color: #5a5a5a;
        }

    </style>
    <dialog id="starred-posts-dialog">
      <button id="close-starred-posts"><iconify-icon icon="octicon:x-12"></iconify-icon></button>
      <section id="starredposts-wrapper">
        <section id="posts-container"></section>
      </section>
    </dialog>
</template>
`,
  );

  customElements.define("starred-posts-component", StarredPosts);
}

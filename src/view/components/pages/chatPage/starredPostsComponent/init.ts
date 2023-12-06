import StarredPosts from ".";

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
          width: 300px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
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

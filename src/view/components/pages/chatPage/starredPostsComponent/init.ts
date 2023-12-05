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
    <section id="starredposts-wrapper">
      <section id="posts-container">
      </section>
    </section>
</template>
`,
  );

  customElements.define("starred-posts-component", StarredPosts);
}
